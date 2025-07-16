import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiController } from './controllers/api.controller';
import { StripeController } from './controllers/stripe.controller';
import { SessionService } from './services/session.service';
import { AnswersService } from './services/answers.service';
import { OpenAIService } from './services/openai.service';
import { SupabaseService } from './services/supabase.service';
import { StripeService } from './services/stripe.service';
import { FocusSessionService } from './services/focus-session.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [ApiController, StripeController],
  providers: [SessionService, AnswersService, OpenAIService, SupabaseService, StripeService, FocusSessionService],
})
export class AppModule {} 