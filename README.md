# Ember Balance AI - Backend API

Backend API для AI-помощника Ember, который помогает пользователям восстановить баланс жизни.

## Технологии

- **NestJS** - фреймворк для Node.js
- **TypeScript** - типизированный JavaScript
- **OpenAI API** - для AI функциональности
- **Supabase** - для хранения данных
- **Stripe** - для платежей
- **Swagger** - для API документации

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/Lopeloop/cursorBackEndBalanceAI.git
cd cursorBackEndBalanceAI
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` на основе `env.example`:
```bash
cp env.example .env
```

4. Заполните переменные окружения в `.env`:
```env
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Database
DATABASE_URL=your_database_url

# Server
PORT=3001
NODE_ENV=development
```

## Запуск

### Разработка
```bash
npm run start:dev
```

### Продакшн
```bash
npm run build
npm run start:prod
```

## API Endpoints

### Health Check
- `GET /api/health` - проверка состояния API

### Основные эндпоинты
- `POST /api/answers` - отправка ответов пользователя
- `POST /api/chat` - чат с AI
- `GET /api/report` - получение отчета

### Focus Session
- `POST /api/focus/:category` - начало фокус-сессии
- `POST /api/focus/:category/answer` - ответ на вопрос фокус-сессии
- `POST /api/focus/:category/activities` - выбор активностей

### Check-in
- `POST /api/check-in` - еженедельная проверка
- `GET /api/session-summary` - сводка сессии

### Stripe Payments
- `GET /stripe/publishable-key` - получение публичного ключа Stripe
- `POST /stripe/create-payment-intent` - создание платежного намерения
- `POST /stripe/create-customer` - создание клиента
- `POST /stripe/create-subscription` - создание подписки
- `POST /stripe/webhook` - webhook для Stripe

## Документация API

После запуска сервера документация Swagger доступна по адресу:
```
http://localhost:3001/api/docs
```

## База данных

Схема базы данных находится в файле `supabase-schema.sql`.

## Разработка

### Структура проекта
```
src/
├── controllers/     # Контроллеры API
├── services/       # Бизнес-логика
├── dto/           # Data Transfer Objects
├── entities/      # Сущности базы данных
├── types/         # TypeScript типы
└── main.ts        # Точка входа
```

### Тестирование
```bash
npm run test
npm run test:e2e
```

## Лицензия

MIT 