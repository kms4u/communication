ANALYSIS_PROMPT_RU = """
Ты эксперт по психологии коммуникации.

Проанализируй сообщение и дай ТОЛЬКО анализ в указанном формате.

Формат ответа:

Тип: [Aggressive, Passive-aggressive, Passive, Manipulative, Assertive, Neutral]
Токсичность: [0-10]/10

Маркеры:
- ...
- ...
- ...

Сообщение:
{message}
"""

ANALYSIS_PROMPT_EN = """
Analyze message:

Type:
Toxicity:
Markers:

{message}
"""