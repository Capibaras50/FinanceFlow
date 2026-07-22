import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Message } from 'src/chat/entities/chat.entity';
import { Env } from 'src/models/env.model';

@Injectable()
export class LlmService {
  private readonly aiUrl: string;
  private readonly model: string;

  constructor(private configService: ConfigService<Env>) {
    const url = this.configService.get('AI_URL', { infer: true });
    const model = this.configService.get('MODEL_AI', { infer: true });
    if (typeof url !== 'string' || !url.startsWith('http://')) {
      throw new Error('Put a Ai Url valid');
    }
    if (!model) {
      throw new Error('Put a Model Name');
    }
    this.aiUrl = url;
    this.model = model;
  }

  getAiUrl(): string {
    return this.aiUrl;
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
  ) {
    const historyMessages = (messagesHistory ?? [])
      .filter((msg) => msg.message && msg.message.trim().length > 0)
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.message,
      }));

    const messages: any[] = [];
    if (systemPrompt && systemPrompt.trim().length > 0) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push(...historyMessages);

    const userContent: any[] = [{ type: 'text', text: userMessage }];
    if (mimeType && imageBase64) {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: `data:${mimeType};base64,${imageBase64}`,
        },
      } as any);
    }
    messages.push({ role: 'user', content: userContent });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return messages;
  }

  async createResponseModel(
    systemPrompt: string,
    userMessage: string,
    messagesHistory?: Message[],
    mimeType?: string,
    imageBase64?: string,
  ) {
    try {
      const model = this.getModelName();

      const messages = this.buildMessages(
        systemPrompt,
        userMessage,
        messagesHistory,
        mimeType,
        imageBase64,
      );

      const response = await axios.post(
        this.aiUrl,
        {
          model,
          messages,
          temperature: 0.7,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      return response;
    } catch {
      throw new BadRequestException('The Process Of Extract Data Failed');
    }
  }
}
