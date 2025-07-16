# Развертывание на Render

## Шаг 1: Подготовка репозитория

1. Убедитесь, что ваш код загружен в GitHub репозиторий
2. Проверьте, что файл `render.yaml` присутствует в корне проекта

## Шаг 2: Создание сервиса на Render

1. Перейдите на [render.com](https://render.com)
2. Войдите в аккаунт или создайте новый
3. Нажмите "New +" и выберите "Web Service"
4. Подключите ваш GitHub репозиторий

## Шаг 3: Настройка сервиса

### Основные настройки:
- **Name**: `ember-balance-ai-backend`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`

### Переменные окружения:
Добавьте следующие переменные в разделе "Environment Variables":

```
NODE_ENV=production
PORT=10000
OPENAI_API_KEY=your_openai_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
```

## Шаг 4: Настройка базы данных

### Вариант 1: Supabase (рекомендуется)
1. Создайте проект на [supabase.com](https://supabase.com)
2. Выполните SQL скрипт из `supabase-schema.sql`
3. Получите ключи из настроек проекта

### Вариант 2: PostgreSQL на Render
1. Создайте новый PostgreSQL сервис на Render
2. Скопируйте connection string
3. Добавьте `DATABASE_URL` в переменные окружения

## Шаг 5: Деплой

1. Нажмите "Create Web Service"
2. Render автоматически начнет сборку и деплой
3. Дождитесь завершения деплоя (обычно 5-10 минут)

## Шаг 6: Проверка

После успешного деплоя:

1. **Health Check**: `https://your-app-name.onrender.com/api/health`
2. **API Documentation**: `https://your-app-name.onrender.com/api/docs`

## Troubleshooting

### Проблемы с портом
Render автоматически устанавливает переменную `PORT`, убедитесь что в коде используется:
```typescript
const port = process.env.PORT || 3001;
```

### Проблемы с переменными окружения
- Проверьте, что все переменные добавлены в Render Dashboard
- Убедитесь, что нет лишних пробелов в значениях

### Проблемы с зависимостями
- Убедитесь, что `package.json` содержит все необходимые зависимости
- Проверьте, что `build` скрипт работает локально

### Логи
В Render Dashboard перейдите в раздел "Logs" для просмотра логов деплоя и работы приложения.

## Обновление

Для обновления приложения:
1. Внесите изменения в код
2. Закоммитьте и запушьте в GitHub
3. Render автоматически пересоберет и перезапустит приложение

## Мониторинг

- **Uptime**: Render автоматически мониторит доступность сервиса
- **Logs**: Доступны в реальном времени в Dashboard
- **Metrics**: CPU, память и другие метрики доступны в Dashboard

## Стоимость

- **Free Tier**: До 750 часов в месяц
- **Paid Plans**: От $7/месяц за дополнительные ресурсы

## Безопасность

- Все переменные окружения зашифрованы
- HTTPS включен автоматически
- Автоматические обновления безопасности 