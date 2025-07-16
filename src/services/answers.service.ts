import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { WheelCategory } from '../types';

@Injectable()
export class AnswersService {
  private readonly logger = new Logger(AnswersService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
  ) {}

  async saveAnswers(userId: string, categories: WheelCategory[]): Promise<boolean> {
    const answers = categories.map(category => ({
      category: category.category,
      value: category.value,
    }));
    
    return this.supabaseService.saveAnswers(userId, answers);
  }

  async getLatestAnswers(userId: string): Promise<WheelCategory[]> {
    const answers = await this.supabaseService.getLatestAnswers(userId);
    
    return answers.map(answer => ({
      category: answer.category,
      value: answer.value,
    }));
  }

  async getAnswerHistory(userId: string): Promise<any[]> {
    return this.supabaseService.getLatestAnswers(userId);
  }

  async getAnswersByCategory(userId: string, category: string): Promise<any[]> {
    const answers = await this.supabaseService.getLatestAnswers(userId);
    return answers.filter(answer => answer.category === category);
  }
} 