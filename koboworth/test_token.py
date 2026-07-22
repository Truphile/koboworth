import datetime as dt
from datetime import timedelta
import jwt
SECRET_KEY = "dummy-secret-key-for-test"
ALGORITHM = "HS256"

expire = dt.datetime.now(dt.timezone.utc) + timedelta(minutes=60)
to_encode = {"sub": "lender", "exp": expire}
token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

print("TOKEN:", token)

try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    print("PAYLOAD:", payload)
except Exception as e:
    print("ERROR:", e)
