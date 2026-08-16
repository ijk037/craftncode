import { CreateMLCEngine, MLCEngine, type InitProgressReport } from '@mlc-ai/web-llm';

export const QWEN_MODEL_ID = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class WebLlmService {
  private engine: MLCEngine | null = null;
  private isInitializing: boolean = false;
  private isReady: boolean = false;
  private hasWebGpu: boolean = false;

  constructor() {
    this.hasWebGpu = typeof navigator !== 'undefined' && 'gpu' in navigator;
  }

  public checkWebGpuSupport(): boolean {
    return this.hasWebGpu;
  }

  public isModelReady(): boolean {
    return this.isReady;
  }

  public async initialize(onProgress?: (progress: number, text: string) => void): Promise<boolean> {
    if (this.isReady && this.engine) return true;
    if (this.isInitializing) return false;

    if (!this.hasWebGpu) {
      console.warn('WebGPU is not supported on this device. Falling back to local offline heuristic engine.');
      return false;
    }

    this.isInitializing = true;
    try {
      this.engine = await CreateMLCEngine(QWEN_MODEL_ID, {
        initProgressCallback: (report: InitProgressReport) => {
          if (onProgress) {
            onProgress(report.progress, report.text);
          }
        },
      });
      this.isReady = true;
      this.isInitializing = false;
      return true;
    } catch (err) {
      console.warn('Failed to initialize WebLLM engine, falling back to local heuristic knowledge base:', err);
      this.isInitializing = false;
      this.isReady = false;
      return false;
    }
  }

  public async streamCompletion(
    messages: ChatMessage[],
    onToken: (accumulatedText: string) => void
  ): Promise<string> {
    if (!this.engine || !this.isReady) {
      throw new Error('WebLLM Engine not initialized');
    }

    const systemPrompt: ChatMessage = {
      role: 'system',
      content: `You are RESQ-MESH Disaster AI (Qwen 2.5-0.5B-Instruct). You are running 100% locally on this device in an offline emergency scenario.
Provide clear, actionable, concise step-by-step first-aid and disaster survival instructions.
Prioritize life-saving actions: bleeding control, airway/CPR, burn cooling, bone immobilization, shelter, water purification, and British Red Cross improvised supplies.
Format responses cleanly with markdown bullet points.`,
    };

    const conversation = [systemPrompt, ...messages];

    const asyncChunks = await this.engine.chat.completions.create({
      messages: conversation,
      temperature: 0.3,
      stream: true,
    });

    let fullText = '';
    for await (const chunk of asyncChunks) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullText += content;
      onToken(fullText);
    }

    return fullText;
  }
}

export const webLlmService = new WebLlmService();
