import { IsString, IsNumber, IsArray, IsOptional, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class WheelCategoryDto {
  @ApiProperty({
    description: 'Название категории баланса жизни',
    example: 'Здоровье',
    enum: ['Здоровье', 'Карьера', 'Финансы', 'Отношения', 'Духовность', 'Развлечения', 'Окружение', 'Саморазвитие']
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Оценка категории от 1 до 10',
    example: 7,
    minimum: 1,
    maximum: 10
  })
  @IsNumber()
  @Min(1)
  @Max(10)
  value: number;
}

export class WheelDataDto {
  @ApiProperty({
    description: 'Массив категорий с оценками',
    type: [WheelCategoryDto],
    example: [
      { category: 'Здоровье', value: 7 },
      { category: 'Карьера', value: 8 },
      { category: 'Финансы', value: 6 },
      { category: 'Отношения', value: 9 },
      { category: 'Духовность', value: 5 },
      { category: 'Развлечения', value: 8 },
      { category: 'Окружение', value: 7 },
      { category: 'Саморазвитие', value: 6 }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WheelCategoryDto)
  categories: WheelCategoryDto[];
}

export * from './stripe.dto';

export interface SubmitAnswersDto {
  categories: Array<{
    category: string;
    value: number;
  }>;
}

export interface ChatRequestDto {
  message: string;
  wheelData?: {
    categories: Array<{
      category: string;
      value: number;
    }>;
  };
}

export interface FocusRequestDto {
  category: string;
  currentValue: number;
  wheelData: {
    categories: Array<{
      category: string;
      value: number;
    }>;
  };
}

export interface FocusSessionDto {
  category: string;
  sessionId: string;
  questions: Array<{
    type: 'problem' | 'obstacle' | 'time' | 'activity';
    question: string;
    answer?: string;
  }>;
  timeCommitment?: number; // minutes per week
  selectedActivities?: string[];
  calendarIntegration?: boolean;
  status: 'active' | 'completed' | 'paused';
}

export interface ActivitySuggestionDto {
  category: string;
  timeCommitment: number; // minutes per week
  userContext: string;
  previousAnswers: string[];
}

export interface WeeklyCheckInDto {
  sessionId: string;
  category: string;
  completedActivities: boolean;
  newRating: number;
  continueWorking: boolean;
  notes?: string;
}

export interface SessionSummaryDto {
  sessionId: string;
  focusSessions: FocusSessionDto[];
  wheelData: {
    categories: Array<{
      category: string;
      value: number;
      isWorkingOn?: boolean;
    }>;
  };
  lastCheckIn?: Date;
} 