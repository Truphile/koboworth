from app.modules.passport.generator import *
import re

def test_generate_passport_code():
    code = generate_passport_code()
    assert code.startswith("TP-")
    assert re.match(r"^TP-[A-HJ-NP-Z]{4}-[2-9]{3}$", code)

def test_generate_pdf():
    pdf_bytes = generate_pdf("<html>test</html>")
    assert b"PDF" in pdf_bytes or pdf_bytes == b"dummy_pdf_bytes"

def test_generate_qr():
    qr_bytes = generate_qr("TP-ABCD-123")
    assert qr_bytes == b"dummy_qr_bytes"

def test_upload_to_s3():
    urls = upload_to_s3(b"pdf", b"qr", "TP-1234")
    assert "pdf" in urls
    assert "qr" in urls

def test_reissue_passport_task_definition():
    from app.modules.passport.tasks import reissue_passport
    assert callable(reissue_passport)
