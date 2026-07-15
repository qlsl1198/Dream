import OpenAI from 'openai';
import { Platform } from 'react-native';

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

function getDefaultBaseURL(): string {
  // Android 에뮬레이터는 호스트 머신의 localhost에 10.0.2.2로 접근
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:11434/v1';
  }
  return 'http://localhost:11434/v1';
}

/**
 * Ollama / LM Studio 등 OpenAI 호환 로컬 AI 클라이언트.
 * 클라우드 OpenAI API 대신 로컬 서버를 사용합니다.
 */
export class LocalAIService {
  private static client: OpenAI | null = null;

  static getBaseURL(): string {
    return (
      process.env.EXPO_PUBLIC_LOCAL_AI_BASE_URL?.trim() || getDefaultBaseURL()
    );
  }

  static getModel(): string {
    return process.env.EXPO_PUBLIC_LOCAL_AI_MODEL?.trim() || 'llama3.2';
  }

  static getApiKey(): string {
    // Ollama/LM Studio는 키가 없어도 되지만 OpenAI SDK는 값 필요
    return process.env.EXPO_PUBLIC_LOCAL_AI_API_KEY?.trim() || 'local-ai';
  }

  static getClient(): OpenAI {
    if (!this.client) {
      const baseURL = this.getBaseURL();
      console.log('LocalAI baseURL:', baseURL);
      console.log('LocalAI model:', this.getModel());

      this.client = new OpenAI({
        baseURL,
        apiKey: this.getApiKey(),
        dangerouslyAllowBrowser: true,
      });
    }
    return this.client;
  }

  /** 클라이언트를 환경 변수 변경 후 다시 만들 때 사용 */
  static resetClient(): void {
    this.client = null;
  }

  static async chatCompletion(
    messages: ChatMessage[],
    options?: {
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<string> {
    const completion = await this.getClient().chat.completions.create({
      model: this.getModel(),
      messages,
      max_tokens: options?.maxTokens ?? 1000,
      temperature: options?.temperature ?? 0.7,
    });

    return completion.choices[0]?.message?.content?.trim() || '';
  }

  /** 로컬 AI 서버 연결 가능 여부 확인 */
  static async isAvailable(timeoutMs = 3000): Promise<boolean> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const base = this.getBaseURL().replace(/\/$/, '');
      // OpenAI 호환 /models 또는 Ollama /api/tags
      const modelsUrl = `${base}/models`;
      const response = await fetch(modelsUrl, {
        method: 'GET',
        signal: controller.signal,
      });
      return response.ok;
    } catch (error) {
      console.log('로컬 AI 연결 확인 실패:', error);
      return false;
    } finally {
      clearTimeout(timer);
    }
  }
}
