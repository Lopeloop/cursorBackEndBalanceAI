import { Controller, Post, Get, Body, Headers, HttpException, HttpStatus, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SessionService } from '../services/session.service';
import { AnswersService } from '../services/answers.service';
import { OpenAIService } from '../services/openai.service';
import { FocusSessionService } from '../services/focus-session.service';
import { 
  SubmitAnswersDto, 
  ChatRequestDto, 
  FocusRequestDto,
  FocusSessionDto,
  ActivitySuggestionDto,
  WeeklyCheckInDto,
  SessionSummaryDto
} from '../dto';
import { ApiResponse as ApiResponseType, WheelData } from '../types';
import { 
  SubmitAnswersResponse, 
  ChatResponse, 
  ReportResponse, 
  FocusResponse,
  ApiErrorResponse
} from '../types/api-responses';

@ApiTags('Ember API')
@Controller('api')
export class ApiController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly answersService: AnswersService,
    private readonly openaiService: OpenAIService,
    private readonly focusSessionService: FocusSessionService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('answers')
  @ApiOperation({ summary: 'Submit wheel balance answers' })
  @ApiResponse({ 
    status: 201, 
    description: 'Answers saved successfully',
    type: SubmitAnswersResponse
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - invalid session or data',
    type: ApiErrorResponse
  })
  async submitAnswers(
    @Body() submitAnswersDto: SubmitAnswersDto,
    @Headers('x-session-id') sessionId: string,
  ): Promise<ApiResponseType<{ message: string }>> {
    try {
      if (!sessionId && process.env.NODE_ENV === 'production') {
        throw new HttpException('Session ID required', HttpStatus.BAD_REQUEST);
      }

      if (sessionId) {
        const isValidSession = await this.sessionService.validateSessionId(sessionId);
        if (!isValidSession) {
          throw new HttpException('Invalid session ID format', HttpStatus.BAD_REQUEST);
        }
      }

      let userId = 'mock-user';
      if (sessionId) {
        const user = await this.sessionService.getOrCreateUser(sessionId);
        userId = user.id;
      }
      await this.answersService.saveAnswers(userId, submitAnswersDto.categories);

      return {
        success: true,
        data: { message: 'Answers saved successfully' },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('chat')
  @ApiOperation({ summary: 'Chat with Ember AI' })
  @ApiResponse({ 
    status: 200, 
    description: 'Chat response',
    type: ChatResponse
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - invalid session or message',
    type: ApiErrorResponse
  })
  async chat(
    @Body() chatRequestDto: ChatRequestDto,
    @Headers('x-session-id') sessionId: string,
  ): Promise<ApiResponseType<{ text: string }>> {
    try {
      let wheelData: WheelData = { categories: [] };
      if (sessionId) {
        const user = await this.sessionService.getOrCreateUser(sessionId);
        const latestAnswers = await this.answersService.getLatestAnswers(user.id);
        wheelData = { categories: latestAnswers };
      }

      const response = await this.openaiService.chatWithContext(
        chatRequestDto.message,
        wheelData,
      );

      return {
        success: true,
        data: { text: response },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('report')
  @ApiOperation({ summary: 'Get user balance report' })
  @ApiResponse({ 
    status: 200, 
    description: 'User report',
    type: ReportResponse
  })
  @ApiResponse({ 
    status: 404, 
    description: 'No answers found for user',
    type: ApiErrorResponse
  })
  async getReport(
    @Headers('x-session-id') sessionId: string,
  ): Promise<ApiResponseType<{ summary: string; wheelData: WheelData }>> {
    try {
      let wheelData: WheelData = { categories: [] };
      if (sessionId) {
        const user = await this.sessionService.getOrCreateUser(sessionId);
        const latestAnswers = await this.answersService.getLatestAnswers(user.id);
        if (latestAnswers.length === 0) {
          throw new HttpException('No answers found for user', HttpStatus.NOT_FOUND);
        }
        wheelData = { categories: latestAnswers };
      } else {
        // Мок-данные для разработки
        wheelData = {
          categories: [
            { category: 'Работа', value: 5 },
            { category: 'Семья и отношения', value: 5 },
            { category: 'Друзья и социализация', value: 5 },
            { category: 'Отдых и восстановление', value: 5 },
            { category: 'Здоровье', value: 5 },
            { category: 'Самоощущение', value: 5 },
            { category: 'Хобби', value: 5 },
            { category: 'Финансы', value: 5 },
          ],
        };
      }

      const summary = await this.openaiService.generateReport(wheelData);

      return {
        success: true,
        data: {
          summary,
          wheelData,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('focus/:category')
  @ApiOperation({ summary: 'Start focus session for specific category' })
  @ApiResponse({ 
    status: 200, 
    description: 'Focus session started',
    type: FocusResponse
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - invalid session or category',
    type: ApiErrorResponse
  })
  async startFocusSession(
    @Param('category') category: string,
    @Headers('x-session-id') sessionId: string,
  ): Promise<ApiResponseType<{ question: string; sessionId: string }>> {
    try {
      if (!sessionId) {
        throw new HttpException('Session ID required', HttpStatus.BAD_REQUEST);
      }

      const focusSession = await this.focusSessionService.createFocusSession(sessionId, category);
      
      return {
        success: true,
        data: { 
          question: focusSession.questions[0].question,
          sessionId: focusSession.sessionId
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('focus/:category/answer')
  @ApiOperation({ summary: 'Submit answer for focus session question' })
  @ApiResponse({ 
    status: 200, 
    description: 'Answer submitted successfully',
    type: FocusResponse
  })
  async submitFocusAnswer(
    @Param('category') category: string,
    @Body() body: { answer: string; questionIndex: number },
    @Headers('x-session-id') sessionId: string,
  ): Promise<ApiResponseType<{ 
    response: string; 
    nextQuestion?: string; 
    isComplete: boolean;
    activities?: string[];
  }>> {
    try {
      if (!sessionId) {
        throw new HttpException('Session ID required', HttpStatus.BAD_REQUEST);
      }

      const focusSession = await this.focusSessionService.updateFocusSessionAnswer(
        sessionId,
        category,
        body.questionIndex,
        body.answer
      );

      const isLastQuestion = body.questionIndex === focusSession.questions.length - 1;
      
      if (isLastQuestion) {
        // Generate activity suggestions
        const activities = await this.openaiService.generateActivitySuggestions(
          category,
          focusSession.timeCommitment || 60,
          body.answer,
          focusSession.questions.map(q => q.answer || '').filter(Boolean)
        );

        return {
          success: true,
          data: {
            response: 'Отлично! Теперь давай подберем активности, которые помогут тебе улучшить эту сферу.',
            isComplete: true,
            activities
          }
        };
      } else {
        const nextQuestion = focusSession.questions[body.questionIndex + 1]?.question;
        
        return {
          success: true,
          data: {
            response: 'Спасибо за ответ!',
            nextQuestion,
            isComplete: false
          }
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('focus/:category/activities')
  @ApiOperation({ summary: 'Select activities for focus session' })
  @ApiResponse({ 
    status: 200, 
    description: 'Activities selected successfully'
  })
  async selectActivities(
    @Param('category') category: string,
    @Body() body: { selectedActivities: string[] },
    @Headers('x-session-id') sessionId: string,
  ): Promise<ApiResponseType<{ 
    summary: string;
    calendarIntegration: boolean;
  }>> {
    try {
      if (!sessionId) {
        throw new HttpException('Session ID required', HttpStatus.BAD_REQUEST);
      }

      const focusSession = await this.focusSessionService.selectActivities(
        sessionId,
        category,
        body.selectedActivities
      );

      const summary = await this.openaiService.generateSessionSummary(
        [focusSession],
        { categories: [] }, // Will be updated with actual wheel data
        false
      );

      return {
        success: true,
        data: {
          summary,
          calendarIntegration: true
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('check-in')
  @ApiOperation({ summary: 'Submit weekly check-in' })
  @ApiResponse({ 
    status: 200, 
    description: 'Check-in submitted successfully'
  })
  async submitWeeklyCheckIn(
    @Body() checkInData: WeeklyCheckInDto,
  ): Promise<ApiResponseType<{ 
    summary: string;
    nextSteps: string;
  }>> {
    try {
      const sessionSummary = await this.focusSessionService.submitWeeklyCheckIn(checkInData);
      
      const summary = await this.openaiService.generateSessionSummary(
        sessionSummary.focusSessions,
        sessionSummary.wheelData,
        checkInData.completedActivities
      );

      const nextSteps = checkInData.continueWorking 
        ? 'Продолжаем работу над этой сферой!'
        : 'Отлично! Может быть, хочешь выбрать другую сферу для работы?';

      return {
        success: true,
        data: {
          summary,
          nextSteps
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('session-summary')
  @ApiOperation({ summary: 'Get session summary' })
  @ApiResponse({ 
    status: 200, 
    description: 'Session summary retrieved successfully'
  })
  async getSessionSummary(
    @Headers('x-session-id') sessionId: string,
  ): Promise<ApiResponseType<SessionSummaryDto>> {
    try {
      if (!sessionId) {
        throw new HttpException('Session ID required', HttpStatus.BAD_REQUEST);
      }

      const summary = await this.focusSessionService.getSessionSummary(sessionId);
      
      if (!summary) {
        return {
          success: false,
          error: 'No session summary found'
        };
      }

      return {
        success: true,
        data: summary
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
} 