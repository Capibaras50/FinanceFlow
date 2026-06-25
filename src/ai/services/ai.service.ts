import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { isObject, isString, validate } from 'class-validator';
import { Env } from 'src/models/env.model';
import { ExtractDataDto } from 'src/transactions/dto/extract-data.dto';

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
      const userContent: any[] = [
        {
          type: 'text',
          text: userMessage,
        },
      ];
      if (mimeType && imageBase64) {
        userContent.push({
          type: 'image_url',
          image_url: {
            url: `data:${mimeType};base64,${imageBase64}`,
          },
        } as any);
      }
      const messages = [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userContent,
        },
      ];
      const options = {
        model: 'google/gemma-4-e2b',
        messages,
        temperature: 0.7,
      };
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
      if (!content || !isString(content)) {
        throw new BadRequestException('The Process Of Extract Data Failed');
      }
      const parsedContent: unknown = JSON.parse(content);
      const extractDataDto = new ExtractDataDto();
      if (
        isObject(parsedContent) &&
        'name' in parsedContent &&
        'value' in parsedContent &&
        'description' in parsedContent &&
        'fileName' in parsedContent &&
        'extractionConfidence' in parsedContent &&
        'walletName' in parsedContent &&
        'categoryName' in parsedContent
      ) {
        extractDataDto.name = String(parsedContent.name);
        extractDataDto.value = Number(parsedContent.value);
        extractDataDto.description = String(parsedContent.description);
        extractDataDto.fileName = String(parsedContent.fileName);
        extractDataDto.extractionConfidence = Number(
          parsedContent.extractionConfidence,
        );
        extractDataDto.walletName = String(parsedContent.walletName);
        extractDataDto.categoryName = String(parsedContent.categoryName);
      }
      const errors = await validate(extractDataDto);
      if (errors.length > 0) {
        throw new BadRequestException('The Process Of Extract Data Failed');
      }
      return extractDataDto;
    } catch {
      throw new BadRequestException('The Process Of Extract Data Failed');
    }
  }
}
