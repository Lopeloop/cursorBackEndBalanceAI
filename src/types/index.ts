export interface WheelCategory {
  category: string;
  value: number;
}

export interface WheelData {
  categories: WheelCategory[];
}

export interface User {
  id: string;
  sessionId: string;
  createdAt: Date;
}

export interface Answer {
  id: string;
  userId: string;
  category: string;
  value: number;
  timestamp: Date;
}

export interface Report {
  id: string;
  userId: string;
  summary: string;
  wheelJson: WheelData;
  createdAt: Date;
}

export interface FocusSession {
  id: string;
  userId: string;
  category: string;
  messages: ChatMessage[];
  updatedWheel: WheelData;
  createdAt: Date;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  wheelData?: WheelData;
}

export interface ChatResponse {
  text: string;
  suggestion?: string;
  nextQuestion?: string;
}

export interface FocusRequest {
  category: string;
  currentValue: number;
  wheelData: WheelData;
}

export interface FocusResponse {
  question: string;
  updatedValue?: number;
}

export interface OpenAIPrompt {
  systemPrompt: string;
  userPrompt: string;
  messages?: ChatMessage[];
}

export interface OpenAIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 