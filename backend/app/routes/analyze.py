from fastapi import APIRouter
from app.models.schemas import MessageRequest
from app.services.llm import llm_service
from app.prompts.analysis import ANALYSIS_PROMPT_RU, ANALYSIS_PROMPT_EN
from app.prompts.rewrite import REWRITE_PROMPT_RU, REWRITE_PROMPT_EN

router = APIRouter()

@router.post("/analyze")
async def analyze(req: MessageRequest):
    # Используем await, так как llm_service.generate асинхронный

    if req.lang == "en":
        analysis_prompt = ANALYSIS_PROMPT_EN.format(message=req.text)
        rewrite_prompt = REWRITE_PROMPT_EN.format(message=req.text)
    else:
        analysis_prompt = ANALYSIS_PROMPT_RU.format(message=req.text)
        rewrite_prompt = REWRITE_PROMPT_RU.format(message=req.text)

    analysis = await llm_service.generate(analysis_prompt)
    variants = await llm_service.generate(rewrite_prompt)

    return {
        "analysis": analysis,
        "variants": variants
    }