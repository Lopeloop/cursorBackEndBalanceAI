import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Включаем CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Включаем валидацию
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Ember AI API')
    .setDescription('API для AI-агента Ember, помогающего восстановить баланс жизни')
    .setVersion('1.0')
    .addTag('Ember API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Ember API запущен на порту ${port}`);
  console.log(`📚 Swagger документация доступна по адресу: http://localhost:${port}/api/docs`);
}

bootstrap(); 