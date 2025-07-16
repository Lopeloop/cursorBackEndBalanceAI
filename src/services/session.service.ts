import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  async getOrCreateUser(sessionId: string): Promise<any> {
    const user = await this.supabaseService.getOrCreateUser(sessionId);
    
    if (user) {
      this.logger.log(`User found/created with sessionId: ${sessionId}`);
    }
    
    return user;
  }

  async validateSessionId(sessionId: string): Promise<boolean> {
    if (!sessionId || typeof sessionId !== 'string') {
      return false;
    }
    
    // Проверяем формат UUID v4
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(sessionId);
  }

  async getUserById(userId: string): Promise<any> {
    // Для Supabase используем getOrCreateUser, но можно добавить отдельный метод
    return this.supabaseService.getOrCreateUser(userId);
  }

  async getUserBySessionId(sessionId: string): Promise<any> {
    return this.supabaseService.getOrCreateUser(sessionId);
  }
} 