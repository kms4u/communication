from pydantic import BaseModel

class MessageRequest(BaseModel):
    text: str
    lang: str = "ru"