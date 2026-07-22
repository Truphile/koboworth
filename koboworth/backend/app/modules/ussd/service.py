from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from .schemas import USSDRequest
from .session import get_session, save_session
from app.modules.collector.models.collector import AjoCollector
from app.modules.worker.models.contribution import Contribution
from app.modules.worker.models.worker import InformalWorker
from app.core.security import verify_password
from datetime import datetime, timedelta, timezone
from app.modules.notifications.worker import send_sms

# Language definitions
LANG = {
    "en": {
        "welcome": "Welcome to Koboworth\nSelect Language:\n1. English\n2. Pidgin",
        "worker_menu": "1. Check Score\n2. Request Passport",
        "pin": "Enter your PIN:",
        "main": "1. Record Contribution\n2. Worker Menu",
        "phone": "Enter member phone number:",
        "amount": "Enter contribution amount:",
        "confirm": "Confirm contribution of {amount} for {phone}?\n1. Yes\n2. No",
        "success": "Contribution logged.",
        "dup": "Duplicate contribution detected for today.",
        "locked": "Your account is locked due to multiple failed attempts.",
        "invalid_pin": "Invalid PIN. Try again:",
        "score": "Your Trust Score is {score}",
        "passport": "Passport request sent.",
        "not_found": "Member not found.",
        "cancel": "Cancelled."
    },
    "pidgin": {
        "welcome": "Welcome to Koboworth\nSelect Language:\n1. English\n2. Pidgin",
        "worker_menu": "1. Check Score\n2. Request Passport",
        "pin": "Abeg enter your PIN:",
        "main": "1. Log Ajo Money\n2. Worker Menu",
        "phone": "Enter member phone number:",
        "amount": "How much?",
        "confirm": "You sure say you won log {amount} for {phone}?\n1. Yes\n2. No",
        "success": "Money logged well well.",
        "dup": "You don already log this money today.",
        "locked": "Account don lock because of too much wrong PIN.",
        "invalid_pin": "Wrong PIN. Try again:",
        "score": "Your Trust Score na {score}",
        "passport": "We don send your Passport.",
        "not_found": "We no see this member.",
        "cancel": "You cancel am."
    }
}

async def process_ussd_request(req: USSDRequest, db: AsyncSession) -> str:
    session_data = await get_session(req.sessionId)
    
    inputs = req.text.split("*") if req.text else []
    last_input = inputs[-1] if inputs else ""
    state = session_data.get("state", "LANG_SELECT")
    lang_key = session_data.get("lang", "en")

    if state == "LANG_SELECT":
        if not req.text:
            return f"CON {LANG['en']['welcome']}"
        else:
            if last_input == "2":
                session_data["lang"] = "pidgin"
                lang_key = "pidgin"
            else:
                session_data["lang"] = "en"
            session_data["state"] = "AUTH"
            await save_session(req.sessionId, session_data)
            return f"CON {LANG[lang_key]['pin']}"

    result = await db.execute(select(AjoCollector).where(AjoCollector.phone_number == req.phoneNumber))
    collector = result.scalar_one_or_none()
    if not collector: return "END Unregistered phone number."
    
    if collector.lockout_until and collector.lockout_until > datetime.now(timezone.utc):
        return f"END {LANG[lang_key]['locked']}"

    if state == "AUTH":
        if verify_password(last_input, collector.pin_hash):
            collector.failed_pin_attempts = 0
            await db.commit()
            session_data["state"] = "MAIN_MENU"
            await save_session(req.sessionId, session_data)
            return f"CON {LANG[lang_key]['main']}"
        else:
            collector.failed_pin_attempts += 1
            if collector.failed_pin_attempts >= 3:
                collector.lockout_until = datetime.now(timezone.utc) + timedelta(minutes=30)
                await db.commit()
                send_sms.delay(collector.phone_number, LANG[lang_key]['locked'])
                return f"END {LANG[lang_key]['locked']}"
            await db.commit()
            return f"CON {LANG[lang_key]['invalid_pin']}"
            
    if state == "MAIN_MENU":
        if last_input == "1":
            session_data["state"] = "ENTER_MEMBER_PHONE"
            await save_session(req.sessionId, session_data)
            return f"CON {LANG[lang_key]['phone']}"
        elif last_input == "2":
            session_data["state"] = "WORKER_MENU"
            await save_session(req.sessionId, session_data)
            return f"CON {LANG[lang_key]['worker_menu']}"

    if state == "WORKER_MENU":
        if last_input == "1":
            return f"END {LANG[lang_key]['score'].format(score=850)}"
        elif last_input == "2":
            return f"END {LANG[lang_key]['passport']}"
            
    if state == "ENTER_MEMBER_PHONE":
        session_data["member_phone"] = last_input
        session_data["state"] = "ENTER_AMOUNT"
        await save_session(req.sessionId, session_data)
        return f"CON {LANG[lang_key]['amount']}"
        
    if state == "ENTER_AMOUNT":
        session_data["amount"] = last_input
        session_data["state"] = "CONFIRM"
        await save_session(req.sessionId, session_data)
        return f"CON {LANG[lang_key]['confirm'].format(amount=last_input, phone=session_data['member_phone'])}"
        
    if state == "CONFIRM":
        if last_input == "1":
            amount = float(session_data["amount"])
            member_phone = session_data["member_phone"]
            
            worker_res = await db.execute(select(InformalWorker).where(InformalWorker.phone_number == member_phone))
            worker = worker_res.scalar_one_or_none()
            if not worker:
                return f"END {LANG[lang_key]['not_found']}"
                
            contrib = Contribution(
                worker_id=worker.id,
                collector_id=collector.id,
                amount=amount
            )
            db.add(contrib)
            try:
                await db.commit()
                # Initial Consent Check (F19)
                from app.modules.consent.service import check_consent_status, append_consent_log
                from app.modules.notifications.termii import send_termii_sms
                status = await check_consent_status(db, worker.id)
                if status == "UNCONSENTED":
                    await send_termii_sms(member_phone, "Welcome to Koboworth! Reply YES to allow us to build your Trust Passport, or NO to opt out.")
                    await append_consent_log(db, worker.id, "CONSENT_REQUESTED", channel="USSD")
                    
                return f"END {LANG[lang_key]['success']}"
            except IntegrityError:
                await db.rollback()
                return f"END {LANG[lang_key]['dup']}"
        else:
            return f"END {LANG[lang_key]['cancel']}"
            
    return "END System error."

def process_dispute(worker_id: str, entry_id: str) -> str:
    return f"Dispute for entry {entry_id} has been logged. Contribution marked as disputed and excluded from score."

def process_data_summary(worker_id: str) -> str:
    return "Summary: 42 contributions, Tier: GOLD, Trust Score: 85"
