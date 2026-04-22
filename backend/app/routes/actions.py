from fastapi import APIRouter
from app.models.schemas import MessageRequest
from app.services.llm import ask_llm

router = APIRouter()

@router.post("/soften")
def soften(req: MessageRequest):
    return {"result": ask_llm(f"Сделай мягче:\n{req.text}")}

@router.post("/reply")
def reply(req: MessageRequest):
    return {"result": ask_llm(f"Напиши ответ:\n{req.text}")}

@router.post("/more")
def more(req: MessageRequest):
    return {"result": ask_llm(f"Дай еще варианты:\n{req.text}")}