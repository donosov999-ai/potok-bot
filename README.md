# Potok bot — бот-витрина продуктов (@Potok_999_bot)

Простой Telegram-бот без зависимостей (Node 18+, встроенный `fetch`). Меню-хаб со ссылками на продукты/услуги + Web App-витрина (Telegram Mini App) + маршрутизация по ключевым словам.

## Что умеет
- `/start` — меню с кнопками (продукты, услуги, AI-генерация, контакт) + кнопка открытия Mini App
- Реакция на ключевые слова в сообщении (например «сайт», «бот» → блок услуг; «картинки», «видео» → AI-генерация)
- Inline-подменю через callback-кнопки

## Запуск
```bash
# 1. скопировать шаблон конфига и заполнить своими данными
cp config.example.json config.local.json
# вписать токен от @BotFather и свои ссылки

# 2. запустить (бот работает в режиме polling, пока процесс жив)
node bot.js
```

## Конфиг (`config.local.json`)
| поле | что |
|---|---|
| `token` | токен бота от [@BotFather](https://t.me/BotFather) |
| `contact_username` | твой @username (без @) — куда ведёт «написать лично» |
| `miniapp_url` | https-URL Mini App (например GitHub Pages) |
| `examples_tg`, `instagram` | ссылки на канал/соцсети |
| `products` | ссылки на продукты |

⚠️ `config.local.json` с реальным токеном в git НЕ коммитится (см. `.gitignore`). В репозитории только шаблон `config.example.json`.

## Постоянная работа
`node bot.js` живёт, пока запущен процесс. Для 24/7 — вынести на сервер (systemd / pm2) или переписать на webhook (Supabase Edge Function и т.п.).
