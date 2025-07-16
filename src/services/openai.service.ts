import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { OpenAIPrompt, OpenAIResponse, WheelData, ChatMessage } from '../types';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly openai: OpenAI | null = null;
  private readonly isDevelopment: boolean;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    
    if (!apiKey) {
      if (this.isDevelopment) {
        this.logger.warn('OPENAI_API_KEY not found. Running in development mode with mock responses.');
        // Don't throw error in development mode
      } else {
        this.logger.error('OPENAI_API_KEY environment variable is missing or empty');
        throw new Error('OPENAI_API_KEY environment variable is missing or empty. Please provide it in your .env file.');
      }
    } else {
      this.openai = new OpenAI({
        apiKey: apiKey.trim(),
      });
    }
  }

  private async getMockResponse(prompt: string, context: string): Promise<string> {
    // Простые мок-ответы для разработки
    const responses = [
      "Я понимаю, что это важная сфера для тебя. Давай вместе подумаем, как можно её улучшить.",
      "Спасибо, что поделился этим со мной. Каждый шаг к балансу важен.",
      "Я слышу, что ты хочешь изменить эту область. Что бы ты хотел сделать в первую очередь?",
      "Это отличное наблюдение. Как ты думаешь, что могло бы помочь в этой сфере?",
      "Я поддерживаю тебя в этом пути. Маленькие изменения могут привести к большим результатам."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async generateReport(wheelData: WheelData): Promise<string> {
    if (!this.openai) {
      return this.getMockResponse('report', JSON.stringify(wheelData));
    }

    const systemPrompt = `Ты Ember — заботливый AI, помогающий восстановить баланс между работой, собой, отношениями и отдыхом. Ты не лечишь, не критикуешь, а мягко направляешь и поддерживаешь.

Твоя задача — проанализировать колесо баланса пользователя и дать заботливый, поддерживающий отчёт с рекомендациями.`;

    const userPrompt = `Вот ответы пользователя по сферам жизни:
${wheelData.categories.map(cat => `${cat.category}: ${cat.value}/10`).join('\n')}

Составь заботливый текстовый отчёт (2-3 абзаца) и предложи первые шаги для улучшения самых слабых сфер. Будь эмпатичным и поддерживающим.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content || '';
  }

  async generateFocusQuestion(category: string, currentValue: number, wheelData: WheelData): Promise<string> {
    if (!this.openai) {
      return `Что для тебя означает "${category}" в твоей жизни прямо сейчас?`;
    }

    const systemPrompt = `Ты Ember — заботливый AI, помогающий восстановить баланс между работой, собой, отношениями и отдыхом. Ты не лечишь, не критикуешь, а мягко направляешь и поддерживаешь.

Твоя задача — задать один глубокий, но мягкий вопрос, который поможет пользователю лучше понять свою ситуацию в выбранной сфере.`;

    const userPrompt = `Пользователь хочет проработать сферу "${category}" (текущая оценка: ${currentValue}/10).

Контекст всех сфер:
${wheelData.categories.map(cat => `${cat.category}: ${cat.value}/10`).join('\n')}

Задай один глубокий, но мягкий вопрос, который поможет пользователю лучше понять свою ситуацию в сфере "${category}". Вопрос должен быть открытым и побуждать к размышлению.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return response.choices[0].message.content || '';
  }

  async chatWithContext(message: string, wheelData: WheelData, chatHistory: ChatMessage[] = []): Promise<string> {
    if (!this.openai) {
      return this.getMockResponse('chat', message);
    }

    const systemPrompt = `Ты Ember — заботливый AI, помогающий восстановить баланс между работой, собой, отношениями и отдыхом. Ты не лечишь, не критикуешь, а мягко направляешь и поддерживаешь.

Ты общаешься с пользователем в контексте его колеса баланса. Будь эмпатичным, поддерживающим и помогай пользователю двигаться к лучшему балансу.`;

    const contextPrompt = `Контекст колеса баланса пользователя:
${wheelData.categories.map(cat => `${cat.category}: ${cat.value}/10`).join('\n')}

Сообщение пользователя: ${message}`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...chatHistory.slice(-10), // Последние 10 сообщений для контекста
      { role: 'user' as const, content: contextPrompt }
    ];

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0].message.content || '';
  }

  async generateFocusResponse(
    category: string,
    userAnswer: string,
    currentValue: number,
    wheelData: WheelData,
    chatHistory: ChatMessage[]
  ): Promise<{ response: string; suggestedValue?: number }> {
    if (!this.openai) {
      const response = await this.getMockResponse('focus', userAnswer);
      return { response };
    }

    const systemPrompt = `Ты Ember — заботливый AI, помогающий восстановить баланс между работой, собой, отношениями и отдыхом. Ты не лечишь, не критикуешь, а мягко направляешь и поддерживаешь.

Твоя задача — ответить на ответ пользователя в контексте проработки сферы и, если уместно, предложить новую оценку для этой сферы (от 1 до 10).`;

    const userPrompt = `Прорабатываем сферу "${category}" (текущая оценка: ${currentValue}/10).

Контекст всех сфер:
${wheelData.categories.map(cat => `${cat.category}: ${cat.value}/10`).join('\n')}

Ответ пользователя: ${userAnswer}

Ответь заботливо и поддерживающе. Если считаешь, что пользователь продвинулся в понимании или улучшении этой сферы, предложи новую оценку (от 1 до 10). Если нет — просто поддержи и задай следующий вопрос.

Формат ответа:
- Основной ответ (2-3 предложения)
- Если предлагаешь новую оценку: "Предлагаемая новая оценка: X/10"`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...chatHistory.slice(-5), // Последние 5 сообщений для контекста
      { role: 'user' as const, content: userPrompt }
    ];

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 400,
    });

    const content = response.choices[0].message.content || '';
    
    // Парсим предложенную оценку
    const suggestedValueMatch = content.match(/Предлагаемая новая оценка: (\d+)\/10/);
    const suggestedValue = suggestedValueMatch ? parseInt(suggestedValueMatch[1]) : undefined;

    return {
      response: content.replace(/Предлагаемая новая оценка: \d+\/10/, '').trim(),
      suggestedValue
    };
  }

  async generateActivitySuggestions(
    category: string,
    timeCommitment: number,
    userContext: string,
    previousAnswers: string[]
  ): Promise<string[]> {
    if (!this.openai) {
      return [
        'Пройти 10,000 шагов в день',
        'Выпить 8 стаканов воды',
        'Сделать 20-минутную зарядку',
        'Приготовить здоровый завтрак'
      ];
    }

    const systemPrompt = `Ты Ember — заботливый AI, помогающий восстановить баланс между работой, собой, отношениями и отдыхом. Ты не лечишь, не критикуешь, а мягко направляешь и поддерживаешь.

Твоя задача — предложить конкретные, выполнимые активности для улучшения выбранной сферы жизни, учитывая доступное время и контекст пользователя.`;

    const userPrompt = `Пользователь хочет улучшить сферу "${category}" и готов посвятить этому ${timeCommitment} минут в неделю.

Контекст пользователя: ${userContext}

Предыдущие ответы: ${previousAnswers.join(', ')}

Предложи 5 конкретных, выполнимых активностей, которые помогут улучшить эту сферу. Активности должны быть:
- Реалистичными для указанного времени
- Конкретными и измеримыми
- Подходящими для сферы "${category}"
- Разнообразными (простые действия, психологические техники, мероприятия)

Формат: просто список активностей, по одной на строку.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const content = response.choices[0].message.content || '';
    return content.split('\n').filter(line => line.trim().length > 0).slice(0, 5);
  }

  async generateWeeklyCheckInQuestion(category: string, selectedActivities: string[]): Promise<string> {
    if (!this.openai) {
      return `Привет! Прошла неделя с тех пор, как ты решил работать над сферой "${category}". Удалось ли тебе выполнить запланированные активности? Как ты теперь оцениваешь эту сферу от 1 до 10?`;
    }

    const systemPrompt = `Ты Ember — заботливый AI, помогающий восстановить баланс между работой, собой, отношениями и отдыхом. Ты не лечишь, не критикуешь, а мягко направляешь и поддерживаешь.

Твоя задача — задать заботливый вопрос о прогрессе пользователя в выбранной сфере.`;

    const userPrompt = `Прошла неделя с тех пор, как пользователь начал работать над сферой "${category}".

Запланированные активности: ${selectedActivities.join(', ')}

Задай заботливый вопрос о прогрессе, который поможет пользователю:
1. Оценить, удалось ли выполнить запланированное
2. Пересмотреть свою оценку сферы (от 1 до 10)
3. Решить, хочет ли продолжить работу над этой сферой

Будь поддерживающим и не дави.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return response.choices[0].message.content || '';
  }

  async generateSessionSummary(
    focusSessions: any[],
    wheelData: WheelData,
    completedActivities: boolean
  ): Promise<string> {
    if (!this.openai) {
      return `Отлично! Ты уже на пути к цели. Сверимся через неделю, как эти мероприятия повлияют на твое ощущение внутреннего баланса и гармонии.`;
    }

    const systemPrompt = `Ты Ember — заботливый AI, помогающий восстановить баланс между работой, собой, отношениями и отдыхом. Ты не лечишь, не критикуешь, а мягко направляешь и поддерживаешь.

Твоя задача — подвести итоги сессии и дать поддерживающее заключение.`;

    const userPrompt = `Пользователь завершил сессию работы над балансом жизни.

Фокус-сессии: ${focusSessions.map(s => `${s.category}: ${s.selectedActivities?.join(', ')}`).join('; ')}

Текущее колесо баланса: ${wheelData.categories.map(cat => `${cat.category}: ${cat.value}/10`).join(', ')}

Удалось ли выполнить запланированное: ${completedActivities ? 'Да' : 'Нет'}

Подведи итоги сессии (2-3 абзаца) и напиши поддерживающее заключение в духе:
"Отлично! Ты уже на пути к цели. Сверимся через неделю, как эти мероприятия повлияют на твое ощущение внутреннего баланса и гармонии."

Баланс достичь сложно, кто-то считает что это вообще миф. Но мы точно можем вместе маленькими шагами улучшать разные сферы твоей жизни или брать в фокус какие-то конкретные, для достижения там результата. Главное – теперь мы делаем это осознанно, а значит, избавляемся от дополнительной тревоги и находим внутреннюю гармонию.`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    return response.choices[0].message.content || '';
  }
} 