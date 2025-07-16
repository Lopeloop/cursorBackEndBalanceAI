import { ApiProperty } from '@nestjs/swagger';

export class ApiSuccessResponse<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  data: T;
}

export class ApiErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Error message' })
  error: string;
}

export class SubmitAnswersResponse {
  @ApiProperty({ example: 'Answers saved successfully' })
  message: string;
}

export class ChatResponse {
  @ApiProperty({ example: 'Вот несколько рекомендаций для улучшения вашего здоровья...' })
  text: string;
}

export class ReportResponse {
  @ApiProperty({ 
    example: 'Анализ вашего колеса баланса показывает, что вы хорошо справляетесь с карьерой и отношениями, но есть возможности для улучшения в области здоровья и финансов...' 
  })
  summary: string;

  @ApiProperty({
    example: {
      categories: [
        { category: 'Здоровье', value: 7 },
        { category: 'Карьера', value: 8 },
        { category: 'Финансы', value: 6 },
        { category: 'Отношения', value: 9 },
        { category: 'Духовность', value: 5 },
        { category: 'Развлечения', value: 8 },
        { category: 'Окружение', value: 7 },
        { category: 'Саморазвитие', value: 6 }
      ]
    }
  })
  wheelData: {
    categories: Array<{
      category: string;
      value: number;
    }>;
  };
}

export class FocusResponse {
  @ApiProperty({ 
    example: 'Какие конкретные шаги вы можете предпринять в ближайшие 2 недели для улучшения вашего здоровья?' 
  })
  question: string;
}

export class PaymentIntentResponse {
  @ApiProperty({ example: 'pi_1234567890_secret_1234567890' })
  clientSecret: string;
}

export class CustomerResponse {
  @ApiProperty({ example: 'cus_1234567890' })
  customerId: string;
}

export class SubscriptionResponse {
  @ApiProperty({ example: 'sub_1234567890' })
  subscriptionId: string;

  @ApiProperty({ example: 'pi_1234567890_secret_1234567890', required: false })
  clientSecret?: string;
}

export class PublishableKeyResponse {
  @ApiProperty({ example: 'pk_test_1234567890' })
  publishableKey: string;
}

export class WebhookResponse {
  @ApiProperty({ example: true })
  received: boolean;
} 