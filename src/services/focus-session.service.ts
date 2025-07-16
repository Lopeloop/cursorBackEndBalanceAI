import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FocusSessionDto, ActivitySuggestionDto, WeeklyCheckInDto, SessionSummaryDto } from '../dto';
import { WheelData } from '../types';

@Injectable()
export class FocusSessionService {
  private readonly logger = new Logger(FocusSessionService.name);
  private readonly focusSessions: Map<string, FocusSessionDto> = new Map();

  constructor(private readonly configService: ConfigService) {}

  async createFocusSession(sessionId: string, category: string): Promise<FocusSessionDto> {
    const focusSession: FocusSessionDto = {
      category,
      sessionId,
      questions: [
        {
          type: 'problem',
          question: `Что именно за проблемы есть в сфере "${category}"? Опиши конкретно, что тебя беспокоит.`
        },
        {
          type: 'obstacle',
          question: `Что именно мешало тебе решить эти проблемы раньше? Какие препятствия ты видишь?`
        },
        {
          type: 'time',
          question: `Сколько времени на следующей неделе ты хотел бы посвятить улучшению сферы "${category}"? (от 10 минут до 84 часов)`
        }
      ],
      status: 'active'
    };

    this.focusSessions.set(`${sessionId}-${category}`, focusSession);
    return focusSession;
  }

  async getFocusSession(sessionId: string, category: string): Promise<FocusSessionDto | null> {
    return this.focusSessions.get(`${sessionId}-${category}`) || null;
  }

  async updateFocusSessionAnswer(
    sessionId: string,
    category: string,
    questionIndex: number,
    answer: string
  ): Promise<FocusSessionDto> {
    const session = await this.getFocusSession(sessionId, category);
    if (!session) {
      throw new Error('Focus session not found');
    }

    if (session.questions[questionIndex]) {
      session.questions[questionIndex].answer = answer;
    }

    // If this was the time commitment question, parse the time
    if (session.questions[questionIndex]?.type === 'time') {
      const timeMatch = answer.match(/(\d+)/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        session.timeCommitment = hours * 60; // Convert to minutes
      }
    }

    this.focusSessions.set(`${sessionId}-${category}`, session);
    return session;
  }

  async generateActivitySuggestions(
    category: string,
    timeCommitment: number,
    userContext: string,
    previousAnswers: string[]
  ): Promise<string[]> {
    // Mock activity suggestions based on category and time commitment
    const activityMap: Record<string, string[]> = {
      'Здоровье': [
        'Пройти 10,000 шагов в день',
        'Выпить 8 стаканов воды',
        'Сделать 20-минутную зарядку',
        'Приготовить здоровый завтрак',
        'Пройти медицинский осмотр'
      ],
      'Работа': [
        'Составить план на неделю',
        'Научиться новой технологии',
        'Сеть с коллегами',
        'Организовать рабочее место',
        'Пройти онлайн-курс'
      ],
      'Семья и отношения': [
        'Провести вечер без телефона',
        'Спланировать семейный ужин',
        'Сказать комплимент близкому',
        'Сделать что-то приятное для партнера',
        'Поговорить о планах на будущее'
      ],
      'Друзья и социализация': [
        'Написать другу',
        'Спланировать встречу',
        'Присоединиться к клубу по интересам',
        'Позвонить старому другу',
        'Организовать вечеринку'
      ],
      'Отдых и восстановление': [
        'Принять горячую ванну',
        'Почитать книгу',
        'Послушать музыку',
        'Прогуляться в парке',
        'Помедитировать 10 минут'
      ],
      'Самоощущение': [
        'Записать 3 благодарности',
        'Сделать что-то для себя',
        'Практиковать самосострадание',
        'Вести дневник',
        'Попробовать новое хобби'
      ],
      'Хобби': [
        'Начать рисовать',
        'Изучить новый язык',
        'Собрать пазл',
        'Попробовать готовить',
        'Начать коллекционировать'
      ],
      'Финансы': [
        'Составить бюджет',
        'Отложить 10% от дохода',
        'Изучить инвестиции',
        'Погасить долги',
        'Создать финансовую подушку'
      ]
    };

    const activities = activityMap[category] || [
      'Провести время наедине с собой',
      'Попробовать что-то новое',
      'Сделать что-то приятное',
      'Практиковать осознанность',
      'Поблагодарить себя за усилия'
    ];

    // Filter activities based on time commitment
    const timeBasedActivities = activities.filter(() => {
      const random = Math.random();
      return random > 0.3; // 70% chance to include each activity
    });

    return timeBasedActivities.slice(0, 5); // Return up to 5 activities
  }

  async selectActivities(
    sessionId: string,
    category: string,
    selectedActivities: string[]
  ): Promise<FocusSessionDto> {
    const session = await this.getFocusSession(sessionId, category);
    if (!session) {
      throw new Error('Focus session not found');
    }

    session.selectedActivities = selectedActivities;
    session.status = 'completed';
    this.focusSessions.set(`${sessionId}-${category}`, session);
    return session;
  }

  async submitWeeklyCheckIn(checkInData: WeeklyCheckInDto): Promise<SessionSummaryDto> {
    const session = await this.getFocusSession(checkInData.sessionId, checkInData.category);
    if (!session) {
      throw new Error('Focus session not found');
    }

    // Update the session status based on check-in
    if (checkInData.continueWorking) {
      session.status = 'active';
    } else {
      session.status = 'completed';
    }

    this.focusSessions.set(`${checkInData.sessionId}-${checkInData.category}`, session);

    // Create session summary
    const summary: SessionSummaryDto = {
      sessionId: checkInData.sessionId,
      focusSessions: [session],
      wheelData: {
        categories: [
          { category: checkInData.category, value: checkInData.newRating, isWorkingOn: checkInData.continueWorking }
        ]
      },
      lastCheckIn: new Date()
    };

    return summary;
  }

  async getSessionSummary(sessionId: string): Promise<SessionSummaryDto | null> {
    const sessions = Array.from(this.focusSessions.values())
      .filter(session => session.sessionId === sessionId);

    if (sessions.length === 0) {
      return null;
    }

    return {
      sessionId,
      focusSessions: sessions,
      wheelData: {
        categories: sessions.map(session => ({
          category: session.category,
          value: 5, // Default value, should be updated with actual wheel data
          isWorkingOn: session.status === 'active'
        }))
      },
      lastCheckIn: new Date()
    };
  }

  async getActiveFocusSessions(sessionId: string): Promise<FocusSessionDto[]> {
    return Array.from(this.focusSessions.values())
      .filter(session => session.sessionId === sessionId && session.status === 'active');
  }
} 