from fastapi import APIRouter
from app.models.schemas import MessageRequest
from app.services.llm import llm_service

router = APIRouter()


@router.post("/soften")
async def soften(req: MessageRequest):
    if req.lang == "en":
        prompt = f"Make this message softer and more polite in English:\n{req.text}\nRespond only with the softened version."
    else:
        prompt = f"Сделай это сообщение мягче и вежливее на русском языке:\n{req.text}\nОтветь только смягчённой версией."

    result = await llm_service.generate(prompt)
    return {"result": result}


@router.post("/reply")
async def reply(req: MessageRequest):
    if req.lang == "en":
        prompt = f"Write a constructive, polite reply to this message in English:\n{req.text}\nRespond only with the reply."
    else:
        prompt = f"Напиши конструктивный, вежливый ответ на это сообщение на русском языке:\n{req.text}\nОтветь только ответом."

    result = await llm_service.generate(prompt)
    return {"result": result}


@router.post("/more")
async def more(req: MessageRequest):
    if req.lang == "en":
        prompt = f"Provide more alternative ways to say this constructively in English:\n{req.text}\nRespond with 2-3 alternatives."
    else:
        prompt = f"Дай ещё варианты конструктивной переформулировки этого сообщения на русском языке:\n{req.text}\nОтветь 2-3 вариантами."

    result = await llm_service.generate(prompt)
    return {"result": result}