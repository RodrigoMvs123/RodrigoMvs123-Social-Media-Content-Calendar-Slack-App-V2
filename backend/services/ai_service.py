import openai
import os
from typing import List, Tuple
from ..schemas import PlatformType, AIContentRequest

class AIService:
    def __init__(self):
        openai.api_key = os.getenv("OPENAI_API_KEY")
        self.platform_prompts = {
            PlatformType.TWITTER: "Create a concise and engaging tweet",
            PlatformType.LINKEDIN: "Write a professional LinkedIn post",
            PlatformType.INSTAGRAM: "Create an engaging Instagram caption",
            PlatformType.FACEBOOK: "Write an engaging Facebook post"
        }
        self.max_lengths = {
            PlatformType.TWITTER: 280,
            PlatformType.LINKEDIN: 3000,
            PlatformType.INSTAGRAM: 2200,
            PlatformType.FACEBOOK: 63206
        }

    async def generate_content(self, request: AIContentRequest) -> Tuple[str, List[str]]:
        try:
            base_prompt = self.platform_prompts[request.platform]
            max_length = request.length or self.max_lengths[request.platform]
            
            prompt = f"{base_prompt} about {request.topic}. "
            prompt += f"The tone should be {request.tone}. "
            prompt += f"Keep it under {max_length} characters. "
            prompt += "Generate the main content followed by 2 alternative suggestions, separated by '|||'."

            response = await openai.ChatCompletion.acreate(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a social media content expert."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1000
            )

            # Split the response into main content and suggestions
            full_response = response.choices[0].message.content
            parts = full_response.split("|||")
            
            main_content = parts[0].strip()
            suggestions = [s.strip() for s in parts[1:] if s.strip()]

            # Validate length
            if len(main_content) > max_length:
                main_content = main_content[:max_length]

            return main_content, suggestions

        except Exception as e:
            raise Exception(f"Error generating content: {str(e)}")

ai_service = AIService() 