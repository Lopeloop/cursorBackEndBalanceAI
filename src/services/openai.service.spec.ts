import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OpenAIService } from './openai.service';
import { WheelData } from '../types';

describe('OpenAIService', () => {
  let service: OpenAIService;
  let configService: ConfigService;

  const mockWheelData: WheelData = {
    categories: [
      { category: 'Работа', value: 7 },
      { category: 'Здоровье', value: 4 },
      { category: 'Отдых', value: 3 },
    ],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenAIService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-api-key'),
          },
        },
      ],
    }).compile();

    service = module.get<OpenAIService>(OpenAIService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateReport', () => {
    it('should generate a report for wheel data', async () => {
      // Mock OpenAI response
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Это ваш персональный анализ баланса жизни...',
            },
          },
        ],
      };

      // Mock OpenAI client
      jest.spyOn(service as any, 'openai').mockReturnValue({
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue(mockResponse),
          },
        },
      });

      const result = await service.generateReport(mockWheelData);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('generateFocusQuestion', () => {
    it('should generate a focus question for a category', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Как вы думаете, что мешает вам достичь лучшего баланса в этой сфере?',
            },
          },
        ],
      };

      jest.spyOn(service as any, 'openai').mockReturnValue({
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue(mockResponse),
          },
        },
      });

      const result = await service.generateFocusQuestion('Здоровье', 4, mockWheelData);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('chatWithContext', () => {
    it('should generate a chat response with context', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Понимаю вашу ситуацию. Давайте разберем это подробнее...',
            },
          },
        ],
      };

      jest.spyOn(service as any, 'openai').mockReturnValue({
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue(mockResponse),
          },
        },
      });

      const result = await service.chatWithContext('Мне сложно найти время для отдыха', mockWheelData);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
}); 