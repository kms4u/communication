from pydantic import BaseModel
from typing import Optional

class MessageRequest(BaseModel):
    text: str
    lang: Optional[str] = "ru"