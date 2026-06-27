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
const OWNER = cfg.owner_id; // chat_id владельца для лид-уведомлений

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
    // два коротких продукта в одну линию (раскрывают подменю с описанием)
    [
      { text: "🎮 PsyGames", callback_data: "psy" },
      { text: "⌨️ TypeRIGHTing", callback_data: "type" },
    ],
    [{ text: "💬 Написать Денису лично", url: `https://t.me/${CONTACT}` }],
  ],
};

const AIGEN_TEXT =
  "🎨 <b>AI-генерация картинок и видео — пачками под бизнес.</b>\n\n" +
  "Не одна картинка для развлечения, а <b>серия в едином стиле под задачу</b>:\n" +
  "• карточки товаров для маркетплейсов (Ozon, WB)\n" +
  "• визуал и баннеры для сайта\n" +
  "• обложки и контент для соцсетей\n" +
  "• короткие AI-видео\n\n" +
  "Работаю <b>батчами</b> — десятки единиц за заход, единый стиль, дешевле штучной отрисовки.\n\n" +
  "👉 Примеры в канале. Нужна пачка под сайт или маркетплейс — пиши.";

const aigenKeyboard = {
  inline_keyboard: [
    // примеры в ТГ и Instagram — в один ряд
    [
      { text: "📸 Примеры (ТГ)", url: EXAMPLES },
      { text: "📷 Instagram", url: IG },
    ],
    [{ text: "✍️ Заказать генерацию", callback_data: "order_aigen" }],
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
    [{ text: "✍️ Оставить заявку", callback_data: "order_asibots" }],
    [{ text: "⬅️ Назад", callback_data: "back" }],
  ],
};

const PSY_TEXT =
  "🎮 <b>PsyGames — тренажёр мозга</b>\n\n" +
  "🧠 47 игр на память, внимание, реакцию, логику и скорость мышления\n" +
  "📈 Уровни, звёзды, прогресс — видно, как растёшь\n" +
  "👨‍👩‍👧 Для детей и взрослых, по паре минут в день\n\n" +
  "Качай когнитивку каждый день 👇";
const TYPE_TEXT =
  "⌨️ <b>TypeRIGHTing — слепая печать</b>\n\n" +
  "🌍 7 языков + национальные раскладки\n" +
  "🎓 Курс с нуля и тренажёр слабых клавиш\n" +
  "📊 Статистика скорости и ошибок\n" +
  "📚 Тексты из литературы, а не скучные строки\n\n" +
  "Печатай быстро, не глядя на клавиши ⚡ 👇";

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
    if (text.startsWith("/id")) {
      const u2 = u.message.from || {};
      await tg("sendMessage", { chat_id: chatId, parse_mode: "HTML",
        text: `Твой chat_id: <code>${chatId}</code>\nusername: @${u2.username || "—"}\n\nСкажи это число Claude — пропишу тебя владельцем для лид-уведомлений.` });
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
    } else if (cq.data === "psy") {
      await tg("editMessageText", { chat_id: chatId, message_id: msgId, text: PSY_TEXT, parse_mode: "HTML", reply_markup: psygamesKeyboard });
    } else if (cq.data === "type") {
      await tg("editMessageText", { chat_id: chatId, message_id: msgId, text: TYPE_TEXT, parse_mode: "HTML", reply_markup: typeKeyboard });
    } else if (cq.data.startsWith("order_")) {
      const kinds = { order_aigen: "AI-генерация картинок и видео", order_asibots: "Сайт / бот / CRM (Asibots)" };
      const kind = kinds[cq.data] || "услуга";
      const f = cq.from || {};
      const who = f.username ? "@" + f.username : (f.first_name || "аноним");
      // уведомление владельцу в личку
      if (OWNER) {
        await tg("sendMessage", { chat_id: OWNER, parse_mode: "HTML",
          text: `🔔 <b>Новый лид!</b>\n\nИнтерес: <b>${kind}</b>\nОт: ${who}\nid: <code>${f.id}</code>\n\n<a href="tg://user?id=${f.id}">Открыть чат с ним</a>` });
      }
      // ответ человеку
      await tg("editMessageText", { chat_id: chatId, message_id: msgId, parse_mode: "HTML",
        text: `✅ Заявка на «${kind}» принята! Денис скоро свяжется.\nИли напиши сам 👇`,
        reply_markup: { inline_keyboard: [
          [{ text: "💬 Написать Денису", url: `https://t.me/${CONTACT}` }],
          [{ text: "⬅️ Меню", callback_data: "back" }],
        ] } });
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
