import { BadRequestException, Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { isObject, isString, validate } from 'class-validator';
import { Message } from 'src/chat/entities/chat.entity';
import { ToolRegistryService } from 'src/financial-tools/services/tool-registry.service';
import { ExtractDataDto } from 'src/transactions/dto/extract-data.dto';
import {
  AssistantChatMessage,
  ChatCompletionResponse,
  ChatMessage,
  ChatWithToolsResult,
} from '../interfaces/llm-message.interface';
import { LlmService } from './llm.service';

@Injectable()
export class AiService {
  private static readonly MAX_TOOL_ITERATIONS = 8;

  constructor(
    private toolRegistry: ToolRegistryService,
    private llmService: LlmService,
  ) {}

  async createResponseModel(
    systemPrompt: string,
    userMessage: string,
    messagesHistory?: Message[],
    mimeType?: string,
    imageBase64?: string,
  ): Promise<AxiosResponse<ChatCompletionResponse>> {
    return this.llmService.createResponseModel(
      systemPrompt,
      userMessage,
      messagesHistory,
      mimeType,
      imageBase64,
    );
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private parseToolArguments(raw: string): Record<string, unknown> {
    try {
      const parsed: unknown = JSON.parse(raw);
      return this.isRecord(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  private buildAssistantHistoryMessage(
    message: AssistantChatMessage,
  ): AssistantChatMessage {
    return {
      role: 'assistant',
      content: message.content ?? null,
      ...(message.tool_calls?.length ? { tool_calls: message.tool_calls } : {}),
      ...(message.reasoning_content != null
        ? { reasoning_content: message.reasoning_content }
        : {}),
    };
  }

  private formatDatesInResult(data: unknown, timezone?: string): unknown {
    if (Array.isArray(data)) {
      return data.map((item) => this.formatDatesInObject(item, timezone));
    }
    if (data && typeof data === 'object') {
      return this.formatDatesInObject(data, timezone);
    }
    return data;
  }

  private formatDatesInObject(obj: unknown, timezone?: string): unknown {
    if (!obj || typeof obj !== 'object') return obj;
    const result = { ...obj } as Record<string, unknown>;
    const dateFields = ['createdAt', 'updatedAt', 'deletedAt'];
    for (const key of Object.keys(result)) {
      const value = result[key];
      if (
        dateFields.includes(key) &&
        typeof value === 'string' &&
        !isNaN(Date.parse(value))
      ) {
        const date = new Date(value);
        const options: Intl.DateTimeFormatOptions = {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        };
        if (timezone) {
          try {
            options.timeZone = timezone;
            result[key] = date.toLocaleDateString('es-MX', options);
            continue;
          } catch {
            // fallback sin timezone si el valor es inválido
          }
        }
        result[key] = date.toLocaleDateString('es-MX', options);
      }
    }
    return result;
  }

  async createChatWithTools(
    systemPrompt: string,
    userMessage: string,
    profileId: number,
    timezone?: string,
  ): Promise<ChatWithToolsResult> {
    try {
      const messages: ChatMessage[] = this.llmService.buildMessages(
        systemPrompt,
        userMessage,
      );

      const tools = this.toolRegistry.getTools();
      const model = this.llmService.getModelName();

      for (
        let iteration = 0;
        iteration < AiService.MAX_TOOL_ITERATIONS;
        iteration++
      ) {
        const response = await this.llmService.postChatCompletion({
          model,
          messages,
          tools,
          tool_choice: 'auto',
          temperature: 0.2,
        });

        const choice = response.data.choices[0];
        if (!choice) {
          throw new Error('The AI response did not include any choice');
        }

        const assistantMessage = choice.message;
        messages.push(this.buildAssistantHistoryMessage(assistantMessage));

        const toolCalls = assistantMessage.tool_calls ?? [];
        if (
          toolCalls.length === 0 ||
          choice.finish_reason === 'stop' ||
          choice.finish_reason === 'length'
        ) {
          return { data: response.data, messages };
        }

        for (const toolCall of toolCalls) {
          const args = this.parseToolArguments(toolCall.function.arguments);

          let result: unknown;
          try {
            result = await this.toolRegistry.executeTool(
              toolCall.function.name,
              profileId,
              args,
            );
          } catch (toolErr) {
            result = { error: (toolErr as Error).message };
          }

          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(this.formatDatesInResult(result, timezone)),
          });
        }
      }

      throw new Error('The maximum number of tool iterations was reached');
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Unknown AI error');
      throw new BadRequestException('The Process Of Chat With Tools Failed');
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
        undefined,
        mimeType,
        receipt,
      );
      const aiResult = response.data;
      const content = aiResult.choices?.[0]?.message?.content;
      if (!content || !isString(content)) {
        throw new BadRequestException('The Process Of Extract Data Failed');
      }
      const parsedContent: unknown = JSON.parse(content);
      const extractDataDto = new ExtractDataDto();
      if (
        isObject(parsedContent) &&
        'isReceipt' in parsedContent &&
        'name' in parsedContent &&
        'value' in parsedContent &&
        'description' in parsedContent &&
        'fileName' in parsedContent &&
        'extractionConfidence' in parsedContent &&
        'walletName' in parsedContent &&
        'categoryName' in parsedContent
      ) {
        extractDataDto.isReceipt = Boolean(parsedContent.isReceipt);
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
      if (errors.length > 0 || !extractDataDto.isReceipt) {
        throw new BadRequestException('The Process Of Extract Data Failed');
      }
      return extractDataDto;
    } catch {
      throw new BadRequestException('The Process Of Extract Data Failed');
    }
  }
}
