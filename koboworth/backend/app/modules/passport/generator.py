import random
import string
from typing import Tuple

def generate_passport_code() -> str:
    letters = "ABCDEFGHJKLMNPRSTUVWXYZ"
    digits = "23456789"
    p1 = "".join(random.choices(letters, k=4))
    p2 = "".join(random.choices(digits, k=3))
    return f"TP-{p1}-{p2}"

def generate_pdf(html_content: str) -> bytes:
    try:
        from weasyprint import HTML
        return HTML(string=html_content).write_pdf()
    except ImportError:
        return b"dummy_pdf_bytes"

def generate_qr(code: str) -> bytes:
    try:
        import qrcode
        from io import BytesIO
        img = qrcode.make(f"https://verify.kobowroth.ng/p/{code}")
        buf = BytesIO()
        img.save(buf, format="PNG")
        return buf.getvalue()
    except ImportError:
        return b"dummy_qr_bytes"

def upload_to_s3(pdf_bytes: bytes, qr_bytes: bytes, code: str) -> dict:
    return {
        "pdf": f"https://s3.amazonaws.com/koboworth-assets/passports/{code}_v1.pdf",
        "qr": f"https://s3.amazonaws.com/koboworth-assets/qrcodes/{code}_v1.png"
    }
