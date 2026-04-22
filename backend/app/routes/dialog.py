from fastapi import APIRouter
from app.models.schemas import MessageRequest
from app.services.llm import llm_service
from app.prompts.dialog import DIALOG_PROMPT_RU, DIALOG_PROMPT_EN

router = APIRouter()

@router.post("/dialog")
async def dialog(req: MessageRequest):
    if req.lang == "en":
        prompt = DIALOG_PROMPT_EN.format(message=req.text)
    else:
        prompt = DIALOG_PROMPT_RU.format(message=req.text)

    result = await llm_service.generate(prompt, max_tokens=800)
    return {"result": result}