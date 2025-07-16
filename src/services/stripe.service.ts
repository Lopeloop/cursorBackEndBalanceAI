import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface CreateCustomerRequest {
  email: string;
  name?: string;
  phone?: string;
}

export interface SubscriptionRequest {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe | null = null;
  private readonly isDevelopment: boolean;

  constructor(private readonly configService: ConfigService) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    
    if (!stripeSecretKey) {
      if (this.isDevelopment) {
        this.logger.warn('Stripe secret key not found. Running in development mode with mock responses.');
      } else {
        this.logger.warn('Stripe secret key not found. Stripe functionality will be disabled.');
      }
    } else {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-06-30.basil',
      });
    }
  }

  /**
   * Создает Payment Intent для обработки платежа
   */
  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<Stripe.PaymentIntent> {
    if (!this.stripe) {
      if (this.isDevelopment) {
        // Возвращаем мок Payment Intent для разработки
        return {
          id: 'pi_mock_' + Date.now(),
          object: 'payment_intent',
          amount: request.amount,
          currency: request.currency,
          status: 'requires_payment_method',
          client_secret: 'pi_mock_secret_' + Date.now(),
          created: Date.now() / 1000,
          customer: request.customerId || null,
          metadata: request.metadata || {},
          payment_method_types: ['card'],
          automatic_payment_methods: { enabled: true },
        } as Stripe.PaymentIntent;
      }
      throw new Error('Stripe is not configured. Please provide STRIPE_SECRET_KEY in environment variables.');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: request.amount,
        currency: request.currency,
        customer: request.customerId,
        metadata: request.metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      this.logger.log(`Payment Intent created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error(`Failed to create Payment Intent: ${error.message}`);
      throw error;
    }
  }

  /**
   * Создает нового клиента в Stripe
   */
  async createCustomer(request: CreateCustomerRequest): Promise<Stripe.Customer> {
    if (!this.stripe) {
      if (this.isDevelopment) {
        // Возвращаем мок Customer для разработки
        return {
          id: 'cus_mock_' + Date.now(),
          object: 'customer',
          email: request.email,
          name: request.name || null,
          phone: request.phone || null,
          created: Date.now() / 1000,
          livemode: false,
          metadata: {},
        } as Stripe.Customer;
      }
      throw new Error('Stripe is not configured. Please provide STRIPE_SECRET_KEY in environment variables.');
    }

    try {
      const customer = await this.stripe.customers.create({
        email: request.email,
        name: request.name,
        phone: request.phone,
      });

      this.logger.log(`Customer created: ${customer.id}`);
      return customer;
    } catch (error) {
      this.logger.error(`Failed to create customer: ${error.message}`);
      throw error;
    }
  }

  /**
   * Создает подписку для клиента
   */
  async createSubscription(request: SubscriptionRequest): Promise<Stripe.Subscription> {
    if (!this.stripe) {
      if (this.isDevelopment) {
        // Возвращаем мок Subscription для разработки
        return {
          id: 'sub_mock_' + Date.now(),
          object: 'subscription',
          customer: request.customerId,
          status: 'active',
          created: Date.now() / 1000,
          current_period_start: Date.now() / 1000,
          current_period_end: (Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000,
          items: {
            object: 'list',
            data: [{
              id: 'si_mock_' + Date.now(),
              object: 'subscription_item',
              price: { id: request.priceId },
              quantity: 1,
            }],
          },
          metadata: request.metadata || {},
        } as unknown as Stripe.Subscription;
      }
      throw new Error('Stripe is not configured. Please provide STRIPE_SECRET_KEY in environment variables.');
    }

    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: request.customerId,
        items: [{ price: request.priceId }],
        metadata: request.metadata,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      this.logger.log(`Subscription created: ${subscription.id}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error.message}`);
      throw error;
    }
  }

  /**
   * Получает информацию о клиенте
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    if (!this.stripe) {
      if (this.isDevelopment) {
        // Возвращаем мок Customer для разработки
        return {
          id: customerId,
          object: 'customer',
          email: 'mock@example.com',
          name: 'Mock Customer',
          created: Date.now() / 1000,
          livemode: false,
          metadata: {},
        } as Stripe.Customer;
      }
      throw new Error('Stripe is not configured. Please provide STRIPE_SECRET_KEY in environment variables.');
    }

    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      return customer as Stripe.Customer;
    } catch (error) {
      this.logger.error(`Failed to retrieve customer: ${error.message}`);
      throw error;
    }
  }

  /**
   * Получает информацию о подписке
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    if (!this.stripe) {
      if (this.isDevelopment) {
        // Возвращаем мок Subscription для разработки
        return {
          id: subscriptionId,
          object: 'subscription',
          customer: 'cus_mock',
          status: 'active',
          created: Date.now() / 1000,
          current_period_start: Date.now() / 1000,
          current_period_end: (Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000,
          items: {
            object: 'list',
            data: [{
              id: 'si_mock',
              object: 'subscription_item',
              price: { id: 'price_mock' },
              quantity: 1,
            }],
          },
          metadata: {},
        } as unknown as Stripe.Subscription;
      }
      throw new Error('Stripe is not configured. Please provide STRIPE_SECRET_KEY in environment variables.');
    }

    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to retrieve subscription: ${error.message}`);
      throw error;
    }
  }

  /**
   * Отменяет подписку
   */
  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    if (!this.stripe) {
      if (this.isDevelopment) {
        // Возвращаем мок отмененной Subscription для разработки
        return {
          id: subscriptionId,
          object: 'subscription',
          customer: 'cus_mock',
          status: 'canceled',
          created: Date.now() / 1000,
          canceled_at: Date.now() / 1000,
          items: {
            object: 'list',
            data: [{
              id: 'si_mock',
              object: 'subscription_item',
              price: { id: 'price_mock' },
              quantity: 1,
            }],
          },
          metadata: {},
        } as unknown as Stripe.Subscription;
      }
      throw new Error('Stripe is not configured. Please provide STRIPE_SECRET_KEY in environment variables.');
    }

    try {
      const subscription = await this.stripe.subscriptions.cancel(subscriptionId);
      this.logger.log(`Subscription cancelled: ${subscriptionId}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to cancel subscription: ${error.message}`);
      throw error;
    }
  }

  /**
   * Получает список платежей клиента
   */
  async getCustomerPayments(customerId: string, limit: number = 10): Promise<Stripe.PaymentIntent[]> {
    if (!this.stripe) {
      if (this.isDevelopment) {
        // Возвращаем мок список платежей для разработки
        return Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
          id: `pi_mock_${i}_${Date.now()}`,
          object: 'payment_intent',
          amount: 1000,
          currency: 'usd',
          status: 'succeeded',
          created: Date.now() / 1000,
          customer: customerId,
          metadata: {},
          payment_method_types: ['card'],
        } as Stripe.PaymentIntent));
      }
      throw new Error('Stripe is not configured. Please provide STRIPE_SECRET_KEY in environment variables.');
    }

    try {
      const paymentIntents = await this.stripe.paymentIntents.list({
        customer: customerId,
        limit,
      });

      return paymentIntents.data;
    } catch (error) {
      this.logger.error(`Failed to get customer payments: ${error.message}`);
      throw error;
    }
  }

  /**
   * Создает webhook endpoint для обработки событий Stripe
   */
  async createWebhookEndpoint(url: string, events: string[]): Promise<Stripe.WebhookEndpoint> {
    if (!this.stripe) {
      if (this.isDevelopment) {
        // Возвращаем мок WebhookEndpoint для разработки
        return {
          id: 'we_mock_' + Date.now(),
          object: 'webhook_endpoint',
          url,
          status: 'enabled',
          created: Date.now() / 1000,
          enabled_events: events,
          metadata: {},
        } as Stripe.WebhookEndpoint;
      }
      throw new Error('Stripe is not configured. Please provide STRIPE_SECRET_KEY in environment variables.');
    }

    try {
      const webhookEndpoint = await this.stripe.webhookEndpoints.create({
        url,
        enabled_events: events as Stripe.WebhookEndpointCreateParams.EnabledEvent[],
      });

      this.logger.log(`Webhook endpoint created: ${webhookEndpoint.id}`);
      return webhookEndpoint;
    } catch (error) {
      this.logger.error(`Failed to create webhook endpoint: ${error.message}`);
      throw error;
    }
  }

  /**
   * Проверяет подпись webhook события
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): Stripe.Event {
    if (!this.stripe) {
      if (this.isDevelopment) {
        // Возвращаем мок Event для разработки
        return {
          id: 'evt_mock_' + Date.now(),
          object: 'event',
          type: 'payment_intent.succeeded',
          created: Date.now() / 1000,
          data: {
            object: {
              id: 'pi_mock',
              object: 'payment_intent',
              amount: 1000,
              currency: 'usd',
              status: 'succeeded',
            },
          },
        } as Stripe.Event;
      }
      throw new Error('Stripe is not configured. Please provide STRIPE_SECRET_KEY in environment variables.');
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error) {
      this.logger.error(`Failed to verify webhook signature: ${error.message}`);
      throw error;
    }
  }

  /**
   * Получает публичный ключ Stripe
   */
  getPublishableKey(): string {
    const publishableKey = this.configService.get<string>('STRIPE_PUBLISHABLE_KEY');
    
    if (!publishableKey) {
      if (this.isDevelopment) {
        return 'pk_test_mock_key_for_development';
      }
      throw new Error('STRIPE_PUBLISHABLE_KEY environment variable is missing.');
    }
    
    return publishableKey;
  }
} 