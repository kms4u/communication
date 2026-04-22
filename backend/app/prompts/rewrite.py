REWRITE_PROMPT_RU = """
Ты эксперт по коммуникации.

Задача: переформулировать сообщение, сделав его более конструктивным и вежливым.

ВАЖНО:
- НЕ отвечай на сообщение
- НЕ извиняйся от имени получателя
- НЕ добавляй новый смысл
- СОХРАНЯЙ исходное лицо (я/ты/он)
- СОХРАНЯЙ намерение сообщения
- Пиши ТОЛЬКО на русском языке
- НЕ добавляй пояснения

Нужно именно переформулировать исходную фразу, а не отвечать на неё.

Формат ответа строго:

Вариант 1:
...

Вариант 2:
...

Сообщение:
{message}
"""

REWRITE_PROMPT_EN = """
You are a communication expert.

Task: rewrite the message to make it more constructive and polite.

IMPORTANT:
- DO NOT reply to the message
- DO NOT apologize as the receiver
- DO NOT change the meaning
- KEEP the same perspective (I/you/he)
- KEEP the original intent
- DO NOT add explanations

You must REWRITE the message, not respond to it.

Format strictly:

Option 1:
...

Option 2:
...

Message:
{message}
"""