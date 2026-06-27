// Potok_999_bot — бот-хаб продуктов ODV999 (PsyGames / TypeRIGHTing / Asibots)
// Тестовый polling-бот без зависимостей (Node 18+ встроенный fetch).
// Запуск: node bot.js   (живёт пока процесс работает)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, "config.local.json"), "utf8"));
const API = `https://api.telegram.org/bot${cfg.token}`;
const P = cfg.products;
const CONTACT = cfg.contact_username; // личный ТГ для заявок
const EXAMPLES = cfg.examples_tg; // ТГ-группа с примерами AI-генераций
const IG = cfg.instagram; // Instagram
const MINIAPP = cfg.miniapp_url; // Telegram Mini App — витрина продуктов

async function tg(method, body) {
  const r = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
}

const WELCOME =
  "👋 Привет! Это витрина проектов <b>Дениса (ODV999)</b>.\n\n" +
  "Здесь мои продукты и услуги. Выбирай 👇";

const mainKeyboard = {
  inline_keyboard: [
    [{ text: "🚀 Открыть витрину", web_app: { url: MINIAPP } }],
    [{ text: "🤖 AI для бизнеса — сайты · боты · CRM", callback_data: "asibots" }],
    [{ text: "🎨 AI-генерация картинок и видео", callback_data: "aigen" }],
    [{ text: "🎮 PsyGames — тренируй мозг", url: P.psygames }],
    [{ text: "⌨️ TypeRIGHTing — научись печатать", url: P.typerighting }],
    [{ text: "💬 Написать Денису лично", url: `https://t.me/${CONTACT}` }],
  ],
};

const AIGEN_TEXT =
  "🎨 <b>AI-генерация картинок и видео — пачкой, под ключ.</b>\n\n" +
  "Не одна картинка, а сразу <b>набор в едином стиле</b> под твой проект: " +
  "лента в соцсетях, карточки товаров, обложки, аватары, баннеры. " +
  "Плюс короткие AI-видео.\n\n" +
  "Делаю <b>батчами</b> — пачка за один заход, единый стиль, быстро и дешевле, чем по одной.\n\n" +
  "👉 Примеры работ — в канале. Хочешь пачку под свой проект — пиши.";

const aigenKeyboard = {
  inline_keyboard: [
    [{ text: "📸 Примеры работ (ТГ)", url: EXAMPLES }],
    [{ text: "📷 Instagram", url: IG }],
    [{ text: "✍️ Заказать генерацию", url: `https://t.me/${CONTACT}` }],
    [{ text: "⬅️ Назад", callback_data: "back" }],
  ],
};

const ASIBOTS_TEXT =
  "🤖 <b>Asibots</b> — AI-системы для бизнеса.\n\n" +
  "• <b>Умные сайты</b> — превращают трафик в заявки, а не просто красивые\n" +
  "• <b>Боты и автоматизация</b> — клиенты и рутина на автопилоте 24/7\n" +
  "• <b>CRM с AI</b> — показывает, где бизнес теряет деньги\n\n" +
  "Этого бота и витрину я собрал сам — это уровень работы. " +
  "Разберу твой бизнес и покажу, что можно усилить.\n\n👇";

const asibotsKeyboard = {
  inline_keyboard: [
    [{ text: "🌐 Посмотреть Asibots", url: P.asibots }],
    [{ text: "✍️ Написать Денису", url: `https://t.me/${CONTACT}` }],
    [{ text: "⬅️ Назад", callback_data: "back" }],
  ],
};

const PSY_TEXT =
  "🎮 <b>PsyGames</b> — 47 игр для тренировки мозга: память, внимание, реакция, логика.\n\nЖми 👇";
const TYPE_TEXT =
  "⌨️ <b>TypeRIGHTing</b> — тренажёр слепой печати: 7 языков, курс, статистика.\n\nЖми 👇";

const psygamesKeyboard = {
  inline_keyboard: [
    [{ text: "🎮 Открыть PsyGames", url: P.psygames }],
    [{ text: "⬅️ Меню", callback_data: "back" }],
  ],
};
const typeKeyboard = {
  inline_keyboard: [
    [{ text: "⌨️ Открыть TypeRIGHTing", url: P.typerighting }],
    [{ text: "⬅️ Меню", callback_data: "back" }],
  ],
};

// Маршрутизация по ключевым словам. Разбиваем на слова и матчим по началу слова —
// так "работа" не ловится как "бот", "суббота" не ловится и т.д.
function routeByKeywords(text) {
  const words = (text || "").toLowerCase().split(/[^a-zа-яё0-9]+/i).filter(Boolean);
  const hit = (...stems) => words.some((w) => stems.some((s) => w.startsWith(s)));

  if (hit("сайт", "лендинг", "crm", "срм", "автоматиз", "бот", "боты", "бота", "ботов", "чат"))
    return { text: ASIBOTS_TEXT, kb: asibotsKeyboard };
  if (hit("картинк", "изображен", "видео", "генерац", "фото", "арт", "баннер", "логотип", "обложк", "нейросет", "дизайн"))
    return { text: AIGEN_TEXT, kb: aigenKeyboard };
  if (hit("игр", "мозг", "память", "внимание", "когнитив", "psygames"))
    return { text: PSY_TEXT, kb: psygamesKeyboard };
  if (hit("печат", "клавиатур", "слепой", "typerighting", "тайп", "набор"))
    return { text: TYPE_TEXT, kb: typeKeyboard };
  return null;
}

async function handleUpdate(u) {
  // обычные сообщения
  if (u.message) {
    const chatId = u.message.chat.id;
    const text = u.message.text || "";
    if (text.startsWith("/start")) {
      await tg("sendMessage", { chat_id: chatId, text: WELCOME, parse_mode: "HTML", reply_markup: mainKeyboard });
      return;
    }
    const route = routeByKeywords(text);
    if (route) {
      await tg("sendMessage", { chat_id: chatId, text: route.text, parse_mode: "HTML", reply_markup: route.kb });
    } else {
      await tg("sendMessage", { chat_id: chatId, text: "Не уверен, что нужно 🤔 Выбери из меню 👇", reply_markup: mainKeyboard });
    }
    return;
  }
  // нажатия inline-кнопок
  if (u.callback_query) {
    const cq = u.callback_query;
    const chatId = cq.message.chat.id;
    const msgId = cq.message.message_id;
    await tg("answerCallbackQuery", { callback_query_id: cq.id });
    if (cq.data === "asibots") {
      await tg("editMessageText", { chat_id: chatId, message_id: msgId, text: ASIBOTS_TEXT, parse_mode: "HTML", reply_markup: asibotsKeyboard });
    } else if (cq.data === "aigen") {
      await tg("editMessageText", { chat_id: chatId, message_id: msgId, text: AIGEN_TEXT, parse_mode: "HTML", reply_markup: aigenKeyboard });
    } else if (cq.data === "back") {
      await tg("editMessageText", { chat_id: chatId, message_id: msgId, text: WELCOME, parse_mode: "HTML", reply_markup: mainKeyboard });
    }
  }
}

let offset = 0;
console.log("Potok_999_bot запущен (polling). Открой @Potok_999_bot в Telegram и жми /start");
async function loop() {
  try {
    const res = await tg("getUpdates", { offset, timeout: 30 });
    if (res.ok) {
      for (const u of res.result) {
        offset = u.update_id + 1;
        await handleUpdate(u);
      }
    }
  } catch (e) {
    console.error("err:", e.message);
    await new Promise((r) => setTimeout(r, 2000));
  }
  loop();
}
loop();
