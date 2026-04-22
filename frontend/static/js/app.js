// const API = window.location.origin;
const API = "http://bore.pub:43363";

// DOM элементы
const chatContainer = document.getElementById('chat');
const inputField = document.getElementById('input');
const typingIndicator = document.getElementById('typingIndicator');
const langBtn = document.getElementById('langToggleBtn');

// состояние
let lastUserMessage = '';
let currentMode = 'message';
let systemMessageTimeout = null;

// 🌍 язык
let currentLang = 'ru';

// 🧠 храним ВСЕ сообщения с НЕИЗМЕНЯЕМЫМ оригиналом
let messages = [];

// 🌐 словарь интерфейса
const i18n = {
    ru: {
        title: "Речевой аналитик",
        subtitle: "Определяю стиль и помогаю общаться конструктивно",
        badge: "Анализ стиля речи",
        placeholder: "Напишите сообщение...",
        expert: "Эксперт",
        empty: "⚠️ Пожалуйста, введите сообщение",
        error: "❌ Ошибка соединения с сервером",
        softenPrefix: "✨ Смягчённая версия:",
        replyPrefix: "💬 Конструктивный ответ:",
        analyzing: "Анализирую",
        softenBtn: "✏️ Смягчить",
        replyBtn: "💬 Ответить",
        dialogBtn: "💭 Диалог",
        messageBtn: "📝 Сообщение",
        welcome: "👋 Привет! Я анализирую стиль речи и помогаю сделать общение конструктивным.\n\n📝 Как это работает:\n• Напишите любое сообщение — я определю его стиль\n• Нажмите \"Смягчить\" — сделаю речь мягче\n• Нажмите \"Ответить\" — предложу конструктивный ответ\n• Нажмите \"💭 Диалог\" — переключитесь в режим анализа диалога между двумя людьми",
        dialogWelcome: "🔄 Режим изменён: Анализ диалога\n\n📝 Как это работает:\n• Отправьте диалог двух людей в формате:\n  `Имя1: Текст сообщения`\n  `Имя2: Текст ответа`\n• Например:\n  `Анна: Привет! Как дела?`\n  `Борис: Нормально, а у тебя?`\n\nЯ проанализирую стиль общения и дам рекомендации для конструктивного диалога.",
        messageWelcome: "🔄 Режим изменён: Анализ сообщений\n\nТеперь я буду анализировать каждое сообщение отдельно, определять стиль речи и предлагать конструктивные варианты."
    },
    en: {
        title: "Speech Analyst",
        subtitle: "Analyzing style and helping communicate constructively",
        badge: "Speech Style Analysis",
        placeholder: "Type a message...",
        expert: "Expert",
        empty: "⚠️ Please enter a message",
        error: "❌ Server connection error",
        softenPrefix: "✨ Softened version:",
        replyPrefix: "💬 Constructive reply:",
        analyzing: "Analyzing",
        softenBtn: "✏️ Soften",
        replyBtn: "💬 Reply",
        dialogBtn: "💭 Dialog",
        messageBtn: "📝 Message",
        welcome: "👋 Hello! I analyze speech style and help make communication constructive.\n\n📝 How it works:\n• Send any message — I'll detect its style\n• Click \"Soften\" — I'll make speech softer\n• Click \"Reply\" — I'll suggest a constructive response\n• Click \"💭 Dialog\" — switch to dialogue analysis mode between two people",
        dialogWelcome: "🔄 Mode changed: Dialog Analysis\n\n📝 How it works:\n• Send a dialogue between two people in format:\n  `Name1: Message text`\n  `Name2: Reply text`\n• Example:\n  `Anna: Hi! How are you?`\n  `Boris: Fine, and you?`\n\nI will analyze the communication style and give recommendations for constructive dialogue.",
        messageWelcome: "🔄 Mode changed: Message Analysis\n\nNow I will analyze each message separately, determine speech style and suggest constructive options."
    }
};

// Словарь для быстрого перевода стандартных сообщений
const staticMessages = {
    ru: {
        welcome: i18n.ru.welcome,
        dialogWelcome: i18n.ru.dialogWelcome,
        messageWelcome: i18n.ru.messageWelcome
    },
    en: {
        welcome: i18n.en.welcome,
        dialogWelcome: i18n.en.dialogWelcome,
        messageWelcome: i18n.en.messageWelcome
    }
};

// ================= UI ОБНОВЛЕНИЕ =================

function updateUI() {
    const titleEl = document.querySelector('h1');
    const subtitleEl = document.querySelector('.subtitle');
    const badgeEl = document.querySelector('.header-badge');

    if (titleEl) {
        titleEl.textContent = i18n[currentLang].title;
        titleEl.style.background = "linear-gradient(135deg, #E8D1C1, #E6DED3)";
        titleEl.style.webkitBackgroundClip = "text";
        titleEl.style.webkitTextFillColor = "transparent";
        titleEl.style.backgroundClip = "text";
    }

    if (subtitleEl) subtitleEl.textContent = i18n[currentLang].subtitle;
    if (badgeEl) badgeEl.textContent = i18n[currentLang].badge;

    inputField.placeholder = i18n[currentLang].placeholder;
    langBtn.innerText = currentLang === 'ru' ? '🇬🇧 EN' : '🇷🇺 RU';

    const softenBtn = document.querySelector('button[onclick="soften()"]');
    const replyBtn = document.querySelector('button[onclick="reply()"]');
    const dialogBtn = document.getElementById('dialogModeBtn');

    if (softenBtn) softenBtn.innerHTML = i18n[currentLang].softenBtn;
    if (replyBtn) replyBtn.innerHTML = i18n[currentLang].replyBtn;
    if (dialogBtn) dialogBtn.innerHTML = currentMode === 'dialog' ? i18n[currentLang].messageBtn : i18n[currentLang].dialogBtn;

    const typingText = document.querySelector('#typingIndicator span');
    if (typingText) typingText.textContent = i18n[currentLang].analyzing;
}

// ================= РЕНДЕР =================

function addMessage(text, isUser = true, originalText = null) {
    // Определяем оригинальный текст
    let original = originalText || text;

    const msg = {
        id: Date.now() + Math.random(),
        text: text,
        original: original,  // НЕИЗМЕНЯЕМЫЙ оригинал
        isUser: isUser
    };

    messages.push(msg);
    addMessageToDOM(msg);
    return msg;
}

function addMessageToDOM(msg) {
    const wrapper = document.createElement('div');
    wrapper.className = `flex ${msg.isUser ? 'justify-end' : 'justify-start'} message-wrapper`;
    wrapper.setAttribute('data-msg-id', msg.id);

    const bubbleClass = msg.isUser
        ? 'user-message text-white rounded-2xl rounded-br-sm shadow-lg'
        : 'bot-message text-gray-100 rounded-2xl rounded-bl-sm shadow-lg';

    const bubble = document.createElement('div');
    bubble.className = `max-w-[80%] p-3 ${bubbleClass}`;

    if (!msg.isUser) {
        const label = document.createElement('div');
        label.className = 'text-xs text-gray-400 mb-1';
        label.innerText = i18n[currentLang].expert;
        bubble.appendChild(label);
    }

    const textNode = document.createElement('div');
    textNode.className = "break-words whitespace-pre-wrap";
    textNode.innerText = msg.text;
    bubble.appendChild(textNode);
    wrapper.appendChild(bubble);
    chatContainer.appendChild(wrapper);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function renderMessages() {
    chatContainer.innerHTML = '';
    messages.forEach(msg => addMessageToDOM(msg));
}

// ================= ПЕРЕВОД СООБЩЕНИЙ =================

async function translateAllMessages() {
    showTyping();

    try {
        for (let msg of messages) {
            if (msg.isUser) continue; // сообщения пользователя не переводим

            // Проверяем, является ли сообщение статическим (приветствие, переключение режима)
            let translated = null;

            if (msg.original === staticMessages.ru.welcome || msg.original === staticMessages.en.welcome) {
                translated = staticMessages[currentLang].welcome;
            } else if (msg.original === staticMessages.ru.dialogWelcome || msg.original === staticMessages.en.dialogWelcome) {
                translated = staticMessages[currentLang].dialogWelcome;
            } else if (msg.original === staticMessages.ru.messageWelcome || msg.original === staticMessages.en.messageWelcome) {
                translated = staticMessages[currentLang].messageWelcome;
            }

            if (translated) {
                msg.text = translated;
            } else {
                // Пробуем перевести через API
                try {
                    const res = await fetch(API + "/translate", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({
                            text: msg.original,
                            target_lang: currentLang
                        })
                    });

                    if (res.ok) {
                        const data = await res.json();
                        msg.text = data.result;
                    } else {
                        msg.text = msg.original;
                    }
                } catch (e) {
                    console.error("API translate error:", e);
                    msg.text = msg.original;
                }
            }
        }

        renderMessages();

    } catch (e) {
        console.error("Translate error:", e);
        showSystemMessage(`Translation error: ${e.message}`, true);
    }

    hideTyping();
}

// ================= ЯЗЫК =================

function toggleLanguage() {
    currentLang = currentLang === 'ru' ? 'en' : 'ru';
    updateUI();
    translateAllMessages();
}

if (langBtn) {
    langBtn.removeEventListener('click', toggleLanguage);
    langBtn.addEventListener('click', toggleLanguage);
}

// ================= UX =================

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
}

function showTyping() {
    typingIndicator.classList.remove('hidden');
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function hideTyping() {
    typingIndicator.classList.add('hidden');
}

function showSystemMessage(message, isError = false) {
    const existingMsg = document.querySelector('.system-message');
    if (existingMsg) existingMsg.remove();
    if (systemMessageTimeout) clearTimeout(systemMessageTimeout);

    const msgDiv = document.createElement('div');
    msgDiv.className = 'system-message flex justify-center';
    const inner = document.createElement('div');
    inner.className = `text-xs px-3 py-1.5 rounded-full ${isError ? 'bg-red-500/80 text-white' : 'bg-green-500/80 text-white'}`;
    inner.style.backdropFilter = 'blur(4px)';
    inner.textContent = message;
    msgDiv.appendChild(inner);
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    systemMessageTimeout = setTimeout(() => {
        if (msgDiv.parentNode) msgDiv.remove();
    }, 3000);
}

// ================= ОТПРАВКА СООБЩЕНИЯ =================

async function sendMessage() {
    const text = inputField.value.trim();

    if (!text) {
        showSystemMessage(i18n[currentLang].empty, true);
        return;
    }

    lastUserMessage = text;
    addMessage(text, true, text);
    inputField.value = '';
    showTyping();

    try {
        let botResponse = '';
        let originalResponse = '';

        if (currentMode === 'dialog') {
            if (typeof window.analyzeDialog === 'function') {
                botResponse = await window.analyzeDialog(text, API, currentLang);
                originalResponse = botResponse;
            } else {
                botResponse = 'Dialog module not loaded';
                originalResponse = botResponse;
            }
        } else {
            const res = await fetch(API + "/analyze", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ text: text, lang: currentLang })
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            if (data.analysis) botResponse += data.analysis;
            if (data.variants) botResponse += '\n\n' + data.variants;
            originalResponse = botResponse;
        }

        addMessage(botResponse, false, originalResponse);

    } catch (e) {
        console.error(e);
        showSystemMessage(i18n[currentLang].error + ': ' + e.message, true);
        addMessage('Error: ' + e.message, false, 'Error: ' + e.message);
    }

    hideTyping();
}

// ================= ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ =================

async function toggleDialogMode() {
    if (currentMode === 'message') {
        currentMode = 'dialog';
        showTyping();
        await new Promise(resolve => setTimeout(resolve, 500));
        addMessage(i18n[currentLang].dialogWelcome, false, i18n[currentLang].dialogWelcome);
        hideTyping();
    } else {
        currentMode = 'message';
        showTyping();
        await new Promise(resolve => setTimeout(resolve, 500));
        addMessage(i18n[currentLang].messageWelcome, false, i18n[currentLang].messageWelcome);
        hideTyping();
    }
    updateUI();
}

// ================= КНОПКИ =================

async function soften() {
    if (!lastUserMessage) {
        showSystemMessage(i18n[currentLang].empty, true);
        return;
    }
    showTyping();
    try {
        const res = await fetch(API + "/soften", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ text: lastUserMessage, lang: currentLang })
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const result = data.result || 'Не удалось смягчить сообщение';
        addMessage(`${i18n[currentLang].softenPrefix}\n\n${result}`, false, result);
    } catch (e) {
        console.error(e);
        showSystemMessage(i18n[currentLang].error, true);
    }
    hideTyping();
}

async function reply() {
    if (!lastUserMessage) {
        showSystemMessage(i18n[currentLang].empty, true);
        return;
    }
    showTyping();
    try {
        const res = await fetch(API + "/reply", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ text: lastUserMessage, lang: currentLang })
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        const result = data.result || 'Не удалось сгенерировать ответ';
        addMessage(`${i18n[currentLang].replyPrefix}\n\n${result}`, false, result);
    } catch (e) {
        console.error(e);
        showSystemMessage(i18n[currentLang].error, true);
    }
    hideTyping();
}

// ================= INIT =================

window.addEventListener('DOMContentLoaded', () => {
    updateUI();
    setTimeout(() => {
        addMessage(i18n[currentLang].welcome, false, i18n[currentLang].welcome);
    }, 200);
    inputField.focus();
});