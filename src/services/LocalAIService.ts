import { NativeModules, Platform } from 'react-native';

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
export type AIStatus = { available: boolean; message: string };

interface OnDeviceBridge {
  status(): Promise<AIStatus>;
  generate(instructions: string, prompt: string): Promise<string>;
  cancel(): void;
}

const bridge = NativeModules.DreamOnDeviceAI as OnDeviceBridge | undefined;

/** iOS Foundation Models only. Never sends user content over a network. */
export class LocalAIService {
  static async getStatus(): Promise<AIStatus> {
    if (Platform.OS !== 'ios' || !bridge) {
      return { available: false, message: '이 환경에서는 기본 해석을 제공합니다. AI는 지원되는 iPhone에서 사용할 수 있어요.' };
    }
    try { return await bridge.status(); }
    catch { return { available: false, message: '온디바이스 AI를 확인할 수 없어 기본 해석을 제공합니다.' }; }
  }

  static async isAvailable(): Promise<boolean> { return (await this.getStatus()).available; }

  static async chatCompletion(messages: ChatMessage[], _options?: { maxTokens?: number; temperature?: number }): Promise<string> {
    if (!bridge || !(await this.isAvailable())) throw new Error('AI_UNAVAILABLE');
    const instructions = messages.filter(m => m.role === 'system').map(m => m.content).join('\n');
    const prompt = messages.filter(m => m.role !== 'system').map(m => m.content).join('\n');
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        bridge.generate(instructions, prompt.slice(0, 6000)),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => { bridge.cancel(); reject(new Error('AI_TIMEOUT')); }, 60_000);
        }),
      ]);
    } finally { if (timer) clearTimeout(timer); }
  }
}
