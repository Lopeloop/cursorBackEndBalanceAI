import { Controller, Post, Get, Body, Headers, HttpException, HttpStatus, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { StripeService } from '../services/stripe.service';
import { ApiResponse as ApiResponseType } from '../types';
import { 
  CreatePaymentIntentRequestDto, 
  CreateCustomerRequestDto, 
  SubscriptionRequestDto 
} from '../dto/stripe.dto';
import {
  PaymentIntentResponse,
  CustomerResponse,
  SubscriptionResponse,
  PublishableKeyResponse,
  WebhookResponse,
  ApiErrorResponse
} from '../types/api-responses';

@ApiTags('Stripe API')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-payment-intent')
  @ApiOperation({ summary: 'Create payment intent' })
  @ApiResponse({ 
    status: 201, 
    description: 'Payment intent created successfully',
    type: PaymentIntentResponse
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - invalid payment data',
    type: ApiErrorResponse
  })
  async createPaymentIntent(
    @Body() request: CreatePaymentIntentRequestDto,
  ): Promise<ApiResponseType<{ clientSecret: string }>> {
    try {
      const paymentIntent = await this.stripeService.createPaymentIntent(request);
      
      return {
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('create-customer')
  @ApiOperation({ summary: 'Create customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  async createCustomer(
    @Body() request: CreateCustomerRequestDto,
  ): Promise<ApiResponseType<{ customerId: string }>> {
    try {
      const customer = await this.stripeService.createCustomer(request);
      
      return {
        success: true,
        data: {
          customerId: customer.id,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('create-subscription')
  @ApiOperation({ summary: 'Create subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  async createSubscription(
    @Body() request: SubscriptionRequestDto,
  ): Promise<ApiResponseType<{ subscriptionId: string; clientSecret?: string }>> {
    try {
      const subscription = await this.stripeService.createSubscription(request);
      
      return {
        success: true,
        data: {
          subscriptionId: subscription.id,
          clientSecret: undefined, // Will be handled in frontend
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('publishable-key')
  @ApiOperation({ summary: 'Get Stripe publishable key' })
  @ApiResponse({ status: 200, description: 'Publishable key retrieved' })
  async getPublishableKey(): Promise<ApiResponseType<{ publishableKey: string }>> {
    try {
      const publishableKey = this.stripeService.getPublishableKey();
      
      return {
        success: true,
        data: {
          publishableKey,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook handler' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(
    @Body() payload: any,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        throw new HttpException('Webhook secret not configured', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const event = this.stripeService.verifyWebhookSignature(
        JSON.stringify(payload),
        signature,
        webhookSecret,
      );

      // Обработка различных типов событий
      switch (event.type) {
        case 'payment_intent.succeeded':
          // Обработка успешного платежа
          console.log('Payment succeeded:', event.data.object);
          break;
        case 'payment_intent.payment_failed':
          // Обработка неудачного платежа
          console.log('Payment failed:', event.data.object);
          break;
        case 'customer.subscription.created':
          // Обработка создания подписки
          console.log('Subscription created:', event.data.object);
          break;
        case 'customer.subscription.updated':
          // Обработка обновления подписки
          console.log('Subscription updated:', event.data.object);
          break;
        case 'customer.subscription.deleted':
          // Обработка удаления подписки
          console.log('Subscription deleted:', event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      throw new HttpException(`Webhook error: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get customer information' })
  @ApiParam({ name: 'customerId', description: 'ID клиента', example: 'cus_1234567890' })
  @ApiResponse({ status: 200, description: 'Customer information retrieved' })
  async getCustomer(@Param('customerId') customerId: string): Promise<ApiResponseType<any>> {
    try {
      const customer = await this.stripeService.getCustomer(customerId);
      
      return {
        success: true,
        data: customer,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('subscription/:subscriptionId')
  @ApiOperation({ summary: 'Get subscription information' })
  @ApiParam({ name: 'subscriptionId', description: 'ID подписки', example: 'sub_1234567890' })
  @ApiResponse({ status: 200, description: 'Subscription information retrieved' })
  async getSubscription(@Param('subscriptionId') subscriptionId: string): Promise<ApiResponseType<any>> {
    try {
      const subscription = await this.stripeService.getSubscription(subscriptionId);
      
      return {
        success: true,
        data: subscription,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('subscription/:subscriptionId/cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiParam({ name: 'subscriptionId', description: 'ID подписки для отмены', example: 'sub_1234567890' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled successfully' })
  async cancelSubscription(@Param('subscriptionId') subscriptionId: string): Promise<ApiResponseType<any>> {
    try {
      const subscription = await this.stripeService.cancelSubscription(subscriptionId);
      
      return {
        success: true,
        data: subscription,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
} 