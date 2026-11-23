import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { Message } from 'src/chat/entities/chat.entity';
import { Env } from 'src/models/env.model';
import {
  ChatCompletionRequestBody,
  ChatCompletionResponse,
  ChatMessage,
  UserContentPart,
} from '../interfaces/llm-message.interface';

@Injectable()
export class LlmService {
  private static readonly MAX_RATE_LIMIT_RETRIES = 3;
  private static readonly MAX_RETRY_DELAY_MS = 60_000;

  private readonly aiUrl: string;
  private readonly aiSecret: string;
  private readonly model: string;

  constructor(private configService: ConfigService<Env>) {
    const url = this.configService.get('AI_URL', { infer: true });
    const secret = this.configService.get('AI_SECRET', { infer: true });
    const model = this.configService.get('MODEL_AI', { infer: true });
    if (typeof url !== 'string' || !url.startsWith('https://')) {
      throw new Error('Put a Ai Url valid');
    }
    if (!model) {
      throw new Error('Put a Model Name');
    }
    if (!secret) {
      throw new Error('Put a Secret Key');
    }
    this.aiUrl = url;
    this.model = model;
    this.aiSecret = secret;
  }

  getAiUrl(): string {
    return this.aiUrl;
  }

  getAiSecret(): string {
    return this.aiSecret;
  }

  getModelName(): string {
    return this.model;
  }

  buildMessages(
    systemPrompt: string,
    userMessage: string,
    messagesHistory?: Message[],
    mimeType?: string,
    imageBase64?: string,
  ): ChatMessage[] {
    const historyMessages: ChatMessage[] = (messagesHistory ?? [])
      .filter((msg) => msg.message && msg.message.trim().length > 0)
      .map((msg): ChatMessage => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.message,
      }));

    const messages: ChatMessage[] = [];
    if (systemPrompt.trim().length > 0) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push(...historyMessages);

    const userContent: UserContentPart[] = [
      { type: 'text', text: userMessage },
    ];
    if (mimeType && imageBase64) {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: `data:${mimeType};base64,${imageBase64}`,
        },
      });
    }
    messages.push({ role: 'user', content: userContent });

    return messages;
  }

  private parseRetryDelay(raw: unknown): number | undefined {
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      return raw > 0 ? raw * 1000 : undefined;
    }
    if (typeof raw !== 'string') {
      return undefined;
    }

    const seconds = Number(raw);
    if (Number.isFinite(seconds)) {
      return seconds > 0 ? seconds * 1000 : undefined;
    }

    const httpDate = Date.parse(raw);
    if (!Number.isNaN(httpDate)) {
      return Math.max(httpDate - Date.now(), 0);
    }

    // Groq devuelve valores como "49.011s" o "2m52.8s".
    const duration = raw.match(
      /(?:(\d+(?:\.\d+)?)h)?(?:(\d+(?:\.\d+)?)m)?(?:(\d+(?:\.\d+)?)s)?/,
    );
    if (duration && (duration[1] || duration[2] || duration[3])) {
      const totalMs =
        (Number(duration[1] ?? 0) * 3600 +
          Number(duration[2] ?? 0) * 60 +
          Number(duration[3] ?? 0)) *
        1000;
      return totalMs > 0 ? totalMs : undefined;
    }

    return undefined;
  }

  private getRetryDelayMs(error: AxiosError<unknown>, attempt: number): number {
    const headers = error.response?.headers;
    const candidates = [
      headers?.['retry-after'],
      headers?.['x-ratelimit-reset-tokens'],
      headers?.['x-ratelimit-reset-requests'],
    ];

    for (const candidate of candidates) {
      const delay = this.parseRetryDelay(candidate);
      if (delay !== undefined) {
        return Math.min(delay + 250, LlmService.MAX_RETRY_DELAY_MS);
      }
    }

    return Math.min(1000 * 2 ** attempt, LlmService.MAX_RETRY_DELAY_MS);
  }

  async postChatCompletion(
    body: ChatCompletionRequestBody,
  ): Promise<AxiosResponse<ChatCompletionResponse>> {
    for (let attempt = 0; ; attempt++) {
      try {
        return await axios.post<ChatCompletionResponse>(this.aiUrl, body, {
          headers: {
            Authorization: `Bearer ${this.aiSecret}`,
            'Content-Type': 'application/json',
            model: this.model,
          },
        });
      } catch (error) {
        if (!axios.isAxiosError(error) || error.response?.status !== 429) {
          throw error;
        }
        if (attempt >= LlmService.MAX_RATE_LIMIT_RETRIES) {
          throw error;
        }

        const delayMs = this.getRetryDelayMs(error, attempt);
        console.warn(
          `Límite de peticiones de la IA alcanzado. Reintentando en ${Math.round(delayMs / 1000)}s (${attempt + 1}/${LlmService.MAX_RATE_LIMIT_RETRIES})`,
        );
        await new Promise<void>((resolve) => {
          setTimeout(resolve, delayMs);
        });
      }
    }
  }

  async createResponseModel(
    systemPrompt: string,
    userMessage: string,
    messagesHistory?: Message[],
    mimeType?: string,
    imageBase64?: string,
  ): Promise<AxiosResponse<ChatCompletionResponse>> {
    try {
      const messages = this.buildMessages(
        systemPrompt,
        userMessage,
        messagesHistory,
        mimeType,
        imageBase64,
      );

      return await this.postChatCompletion({
        model: this.model,
        messages,
        temperature: 0.7,
      });
    } catch {
      throw new BadRequestException('The Process Of Extract Data Failed');
    }
  }
}
