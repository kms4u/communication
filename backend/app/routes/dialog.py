from fastapi import APIRouter
from app.models.schemas import MessageRequest
from app.services.llm import ask_llm
from app.prompts.dialog import DIALOG_PROMPT_RU, DIALOG_PROMPT_EN

router = APIRouter()

@router.post("/dialog")
def dialog(req: MessageRequest):

    if req.lang == "en":
        prompt = DIALOG_PROMPT_EN.format(message=req.text)
    else:
        prompt = DIALOG_PROMPT_RU.format(message=req.text)

    return {"result": ask_llm(prompt, num_predict=800)}