from fastapi import APIRouter, HTTPException, Depends
from ..schemas import AIContentRequest, AIContentResponse
from ..services.ai_service import ai_service
from .auth import get_current_user
from typing import List

router = APIRouter()

@router.post("/generate", response_model=AIContentResponse)
async def generate_content(
    request: AIContentRequest,
    current_user = Depends(get_current_user)
):
    try:
        content, suggestions = await ai_service.generate_content(request)
        return AIContentResponse(
            content=content,
            suggestions=suggestions
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate content: {str(e)}"
        ) 