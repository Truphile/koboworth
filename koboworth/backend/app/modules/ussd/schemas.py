from pydantic import BaseModel

class USSDRequest(BaseModel):
    sessionId: str
    phoneNumber: str
    networkCode: str
    serviceCode: str
    text: str
