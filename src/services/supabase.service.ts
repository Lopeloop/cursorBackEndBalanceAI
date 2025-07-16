import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface User {
  id: string;
  session_id: string;
  created_at: string;
}

export interface Answer {
  id: string;
  user_id: string;
  category: string;
  value: number;
  timestamp: string;
}

export interface Report {
  id: string;
  user_id: string;
  summary: string;
  wheel_json: any;
  created_at: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  category: string;
  messages: any[];
  updated_wheel: any;
  created_at: string;
}

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not found. Using mock data.');
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Создает или получает пользователя по sessionId
   */
  async getOrCreateUser(sessionId: string): Promise<User | null> {
    if (!this.supabase) {
      // Mock user for development
      return {
        id: 'mock-user-id',
        session_id: sessionId,
        created_at: new Date().toISOString(),
      };
    }

    try {
      // Проверяем, существует ли пользователь
      const { data: existingUser } = await this.supabase
        .from('users')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (existingUser) {
        return existingUser;
      }

      // Создаем нового пользователя
      const { data: newUser, error } = await this.supabase
        .from('users')
        .insert({
          session_id: sessionId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return null;
      }

      return newUser;
    } catch (error) {
      console.error('Error in getOrCreateUser:', error);
      return null;
    }
  }

  /**
   * Сохраняет ответы пользователя
   */
  async saveAnswers(userId: string, answers: Array<{ category: string; value: number }>): Promise<boolean> {
    if (!this.supabase) {
      console.log('Mock: Saving answers for user', userId);
      return true;
    }

    try {
      const answersData = answers.map(answer => ({
        user_id: userId,
        category: answer.category,
        value: answer.value,
        timestamp: new Date().toISOString(),
      }));

      const { error } = await this.supabase
        .from('answers')
        .insert(answersData);

      if (error) {
        console.error('Error saving answers:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in saveAnswers:', error);
      return false;
    }
  }

  /**
   * Сохраняет отчет
   */
  async saveReport(userId: string, summary: string, wheelJson: any): Promise<string | null> {
    if (!this.supabase) {
      console.log('Mock: Saving report for user', userId);
      return 'mock-report-id';
    }

    try {
      const { data, error } = await this.supabase
        .from('reports')
        .insert({
          user_id: userId,
          summary,
          wheel_json: wheelJson,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error saving report:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error in saveReport:', error);
      return null;
    }
  }

  /**
   * Получает последний отчет пользователя
   */
  async getLatestReport(userId: string): Promise<Report | null> {
    if (!this.supabase) {
      return null;
    }

    try {
      const { data, error } = await this.supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error getting latest report:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getLatestReport:', error);
      return null;
    }
  }

  /**
   * Сохраняет сессию фокусировки
   */
  async saveFocusSession(userId: string, category: string, messages: any[], updatedWheel: any): Promise<string | null> {
    if (!this.supabase) {
      console.log('Mock: Saving focus session for user', userId);
      return 'mock-focus-session-id';
    }

    try {
      const { data, error } = await this.supabase
        .from('focus_sessions')
        .insert({
          user_id: userId,
          category,
          messages,
          updated_wheel: updatedWheel,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error saving focus session:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error in saveFocusSession:', error);
      return null;
    }
  }

  /**
   * Получает историю чата пользователя
   */
  async getChatHistory(userId: string): Promise<any[]> {
    if (!this.supabase) {
      return [];
    }

    try {
      const { data, error } = await this.supabase
        .from('focus_sessions')
        .select('messages')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error getting chat history:', error);
        return [];
      }

      return data.flatMap(session => session.messages || []);
    } catch (error) {
      console.error('Error in getChatHistory:', error);
      return [];
    }
  }

  /**
   * Получает последние ответы пользователя
   */
  async getLatestAnswers(userId: string): Promise<Answer[]> {
    if (!this.supabase) {
      return [];
    }

    try {
      const { data, error } = await this.supabase
        .from('answers')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(8); // 8 категорий

      if (error) {
        console.error('Error getting latest answers:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error in getLatestAnswers:', error);
      return [];
    }
  }
} 