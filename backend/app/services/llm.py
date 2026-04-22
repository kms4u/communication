import os
from groq import AsyncGroq
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()


class LLMService:
    def __init__(self):
        self.client = AsyncGroq(
            api_key=os.environ.get("GROQ_API_KEY")
        )
        # Используем быструю и умную модель
        self.model = "llama-3.3-70b-versatile"

    async def generate(self, prompt: str, system_prompt: str = None, max_tokens: int = 500) -> str:
        """Генерация ответа через Groq API"""
        messages = []

        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=max_tokens,
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Groq API error: {e}")
            return self._get_fallback_response(prompt)

    def _get_fallback_response(self, prompt: str) -> str:
        """Заглушка на случай ошибки API"""
        if "проанализируй" in prompt.lower():
            return """Тип: Нейтральный
Токсичность: 0/10

Маркеры:
- Спокойный тон
- Отсутствие агрессии
- Конструктивное обращение"""
        elif "смягчи" in prompt.lower():
            return "Пожалуйста, давайте обсудим это спокойно и конструктивно."
        elif "ответ" in prompt.lower():
            return "Спасибо за ваше сообщение. Давайте вместе найдём решение."
        else:
            return "Я понимаю вашу точку зрения. Давайте попробуем найти компромисс."


# Создаём глобальный экземпляр сервиса
llm_service = LLMService()