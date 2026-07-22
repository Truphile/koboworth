import os
import logging
from celery_app import celery_app
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

logger = logging.getLogger(__name__)

@celery_app.task
def send_sms(phone: str, message: str):
    # Retrieve Twilio credentials from environment
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_PHONE_NUMBER")

    # Fallback to mock behavior if Twilio isn't fully configured yet
    if not account_sid or not auth_token or account_sid == "your_twilio_account_sid":
        with open("mock_sms_inbox.txt", "a") as f:
            f.write(f"--- MOCK SMS TO: {phone} ---\n{message}\n\n")
        print(f"[MOCK SMS - Twilio Not Configured] Sent to {phone}: {message}")
        return {"phone": phone, "status": "mocked", "message": "Twilio not configured"}

    try:
        client = Client(account_sid, auth_token)
        
        # Ensure the phone number starts with a + for Twilio (e.g., +234 for Nigeria)
        formatted_phone = phone
        if not phone.startswith("+"):
            # Very basic assumption for local numbers starting with 0
            if phone.startswith("0"):
                formatted_phone = "+234" + phone[1:]
            else:
                formatted_phone = "+" + phone

        # Send the actual SMS
        msg = client.messages.create(
            body=message,
            from_=from_number,
            to=formatted_phone
        )
        
        print(f"[TWILIO SMS SENT] SID: {msg.sid} | To: {formatted_phone}")
        return {"phone": formatted_phone, "status": "sent", "sid": msg.sid}
        
    except TwilioRestException as e:
        logger.error(f"Twilio failed to send SMS to {phone}: {e.msg}")
        return {"phone": phone, "status": "failed", "error": e.msg}
