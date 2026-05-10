import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Env } from 'src/models/env.model';

@Injectable()
export class AiService {
  constructor(private configService: ConfigService<Env>) {
    const aiUrl = this.configService.get('AI_URL', { infer: true });
    if (typeof aiUrl !== 'string' || !aiUrl.startsWith('http://')) {
      throw new Error('Put a Ai Url valid');
    }
  }
  async createResponseModel(
    systemPrompt: string,
    userMessage: string,
    mimeType?: string,
    imageBase64?: string,
  ) {
    try {
      const options = {
        model: 'google/gemma-4-e2b',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userMessage,
              },
            ],
          },
          {
            role: 'system',
            content: [
              {
                type: 'text',
                text: systemPrompt,
              },
            ],
          },
        ],
        temperature: 0.7,
      };
      if (mimeType && imageBase64) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        options.messages[0].content.push({
          type: 'image_url',
          image_url: {
            url: `data:${mimeType};base64,${imageBase64}`,
          },
        } as any);
      }
      const aiUrl = this.configService.get('AI_URL', { infer: true }) as string;
      const response = await axios.post(aiUrl, options, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response;
    } catch {
      throw new BadRequestException('The Process Of Extract Data Failed');
    }
  }

  async extractDataReceipt(
    receipt: string,
    systemPrompt: string,
    mimeType: string,
    userMessage: string,
  ) {
    try {
      const response = await this.createResponseModel(
        systemPrompt,
        userMessage,
        mimeType,
        receipt,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const aiResult = response.data;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const content = aiResult.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No content in AI response');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
      return JSON.parse(content);
    } catch {
      throw new BadRequestException('The Process Of Extract Data Failed');
    }
  }
}
