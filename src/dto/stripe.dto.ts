import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentIntentRequestDto {
  @ApiProperty({
    description: 'Сумма платежа в центах',
    example: 999,
    minimum: 50
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Валюта платежа',
    example: 'usd',
    default: 'usd'
  })
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'ID клиента (опционально)',
    example: 'cus_1234567890',
    required: false
  })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({
    description: 'Метаданные платежа',
    example: { order_id: 'order_123' },
    required: false
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}

export class CreateCustomerRequestDto {
  @ApiProperty({
    description: 'Email клиента',
    example: 'user@example.com'
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Имя клиента',
    example: 'John Doe',
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Телефон клиента',
    example: '+1234567890',
    required: false
  })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class SubscriptionRequestDto {
  @ApiProperty({
    description: 'ID клиента',
    example: 'cus_1234567890'
  })
  @IsString()
  customerId: string;

  @ApiProperty({
    description: 'ID цены подписки',
    example: 'price_1234567890'
  })
  @IsString()
  priceId: string;

  @ApiProperty({
    description: 'Метаданные подписки',
    example: { plan_name: 'Pro Plan' },
    required: false
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, string>;
}

export class WebhookRequestDto {
  @ApiProperty({
    description: 'Тело webhook события от Stripe',
    example: { type: 'payment_intent.succeeded', data: { object: { id: 'pi_123' } } }
  })
  @IsObject()
  payload: any;

  @ApiProperty({
    description: 'Подпись webhook для верификации',
    example: 'whsec_1234567890'
  })
  @IsString()
  signature: string;
} 