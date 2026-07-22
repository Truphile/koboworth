from .termii import send_termii_sms

async def notify_lender_access(phone: str, lender_name: str):
    msg = f"Koboworth alert: {lender_name} has queried your Trust Passport."
    await send_termii_sms(phone, msg)

async def notify_tier_milestone(phone: str, tier: str):
    msg = f"Congrats! You have reached the {tier} tier on Koboworth."
    await send_termii_sms(phone, msg)

async def notify_passport_ready(phone: str, url: str):
    msg = f"Your Koboworth Trust Passport is ready. View it here: {url}"
    await send_termii_sms(phone, msg)
