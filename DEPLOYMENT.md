# Инструкции по развертыванию

## Локальная разработка

1. **Клонирование репозитория**
```bash
git clone https://github.com/Lopeloop/cursorBackEndBalanceAI.git
cd cursorBackEndBalanceAI
```

2. **Установка зависимостей**
```bash
npm install
```

3. **Настройка переменных окружения**
```bash
cp env.example .env
```

Заполните `.env` файл:
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

# Server
PORT=3001
NODE_ENV=development
```

4. **Запуск в режиме разработки**
```bash
npm run start:dev
```

## Продакшн развертывание

### Heroku

1. **Создайте приложение на Heroku**
```bash
heroku create your-app-name
```

2. **Добавьте переменные окружения**
```bash
heroku config:set OPENAI_API_KEY=your_openai_api_key
heroku config:set SUPABASE_URL=your_supabase_url
heroku config:set SUPABASE_ANON_KEY=your_supabase_anon_key
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
heroku config:set STRIPE_SECRET_KEY=your_stripe_secret_key
heroku config:set STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
heroku config:set NODE_ENV=production
```

3. **Деплой**
```bash
git push heroku main
```

### Docker

1. **Создайте Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
```

2. **Сборка и запуск**
```bash
docker build -t ember-backend .
docker run -p 3001:3001 ember-backend
```

### Vercel

1. **Установите Vercel CLI**
```bash
npm i -g vercel
```

2. **Деплой**
```bash
vercel --prod
```

## База данных

### Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Выполните SQL скрипт из `supabase-schema.sql`
3. Получите ключи из настроек проекта

### PostgreSQL (локально)

1. Установите PostgreSQL
2. Создайте базу данных
3. Выполните SQL скрипт из `supabase-schema.sql`

## Мониторинг

### Логи
```bash
# Heroku
heroku logs --tail

# Docker
docker logs container_name

# Локально
npm run start:dev
```

### Health Check
```bash
curl https://your-app.herokuapp.com/api/health
```

## Безопасность

1. **Никогда не коммитьте `.env` файлы**
2. **Используйте HTTPS в продакшне**
3. **Настройте CORS для вашего домена**
4. **Используйте rate limiting**
5. **Валидируйте все входные данные**

## Troubleshooting

### Проблемы с портом
```bash
# Убить процесс на порту 3001
lsof -ti:3001 | xargs kill -9
```

### Проблемы с зависимостями
```bash
rm -rf node_modules package-lock.json
npm install
```

### Проблемы с TypeScript
```bash
npm run build
```

## API Документация

После запуска сервера документация доступна по адресу:
```
http://localhost:3001/api/docs
``` 