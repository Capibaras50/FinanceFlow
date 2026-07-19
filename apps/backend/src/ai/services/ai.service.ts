import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { isObject, isString, validate } from 'class-validator';
import { CategoriesService } from 'src/categories/services/categories.service';
import { Message } from 'src/chat/entities/chat.entity';
import { ToolRegistryService } from 'src/financial-tools/services/tool-registry.service';
import { Env } from 'src/models/env.model';
import { ExtractDataDto } from 'src/transactions/dto/extract-data.dto';
import { WalletsService } from 'src/wallets/services/wallets.service';

@Injectable()
export class AiService {
  constructor(
    private configService: ConfigService<Env>,
    private toolRegistry: ToolRegistryService,
    private categoriesService: CategoriesService,
    private walletsService: WalletsService,
  ) {
    const aiUrl = this.configService.get('AI_URL', { infer: true });
    if (typeof aiUrl !== 'string' || !aiUrl.startsWith('http://')) {
      throw new Error('Put a Ai Url valid');
    }
  }

  private buildMessages(
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
      const messages = this.buildMessages(
        systemPrompt,
        userMessage,
        messagesHistory,
        mimeType,
        imageBase64,
      );

      const aiUrl = this.configService.get('AI_URL', { infer: true }) as string;
      const response = await axios.post(
        aiUrl,
        {
          model: 'google/gemma4:e2b',
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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
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
  ) {
    try {
      const messages = this.buildMessages(systemPrompt, userMessage);

      const tools = this.toolRegistry.getTools();
      const aiUrl = this.configService.get('AI_URL', { infer: true }) as string;

      const firstResponse = await axios.post(
        aiUrl,
        {
          model: 'google/gemma4:e2b',
          messages,
          tools,
          temperature: 0.7,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const firstChoice = firstResponse.data.choices?.[0];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const toolCalls = firstChoice?.message?.tool_calls;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!toolCalls || toolCalls.length === 0) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        return { data: firstResponse.data, messages };
      }

      const toolCallMessage: any = {
        role: 'assistant',
        content: null,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        tool_calls: toolCalls.map(
          (tc: { id: string; type: string; function: unknown }) => ({
            id: tc.id,
            type: tc.type,
            function: tc.function,
          }),
        ),
      };

      const toolResults: any[] = [];
      for (const tc of toolCalls) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const args: Record<string, unknown> = JSON.parse(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          tc.function.arguments as string,
        );

        let result: unknown;
        try {
          result = await this.toolRegistry.executeTool(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            tc.function.name as string,
            profileId,
            args,
          );
        } catch (toolErr) {
          result = { error: (toolErr as Error).message };
        }

        const formattedResult = this.formatDatesInResult(result, timezone);
        toolResults.push({
          role: 'tool',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          tool_call_id: tc.id,
          content: JSON.stringify(formattedResult),
        });
      }

      const secondResponse = await axios.post(
        aiUrl,
        {
          model: 'google/gemma4:e2b',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          messages: [...messages, toolCallMessage, ...toolResults],
          temperature: 0.7,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      return { data: secondResponse.data, messages };
    } catch (err) {
      console.error(err);
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

  async inferBestCategoryTransaction(
    profileId: number,
    nameTransaction: string,
  ): Promise<number> {
    const systemPrompt = `Eres un sistema de matching financiero. Tu tarea es seleccionar la categoría más adecuada de la lista proporcionada basándote en la descripción de una transacción.

Reglas:
- Devuelve ÚNICAMENTE el ID numérico de la categoría, sin texto adicional, sin formato, sin markdown, sin explicaciones.
- Si ninguna categoría coincide exactamente, elige la más cercana por contexto semántico.
- Si hay múltiples candidatos, elige el más relevante para la transacción.`;

    const categories = await this.categoriesService.findAll(profileId);
    const categoriesList = categories
      .map((category) => `${category.id}: ${category.name}`)
      .join('\n');

    const aiResponse = await this.createResponseModel(
      systemPrompt,
      `Categorías del usuario:\n${categoriesList}\n\nNombre de la transacción: "${nameTransaction}"\n\n¿Cuál es el ID de la categoría más adecuada? Responde solo con el número.`,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const content: string = aiResponse.data.choices?.[0]?.message?.content;
    if (!content) {
      return categories[0]?.id;
    }

    const parsedId = Number(content.trim());
    return isNaN(parsedId) ? categories[0]?.id : parsedId;
  }

  async inferBestWalletTransaction(
    profileId: number,
    nameTransaction: string,
  ): Promise<number> {
    const systemPrompt = `Eres un sistema de matching financiero. Tu tarea es seleccionar la cartera (wallet) más adecuada de la lista proporcionada basándote en la descripción de una transacción.

Reglas:
- Devuelve ÚNICAMENTE el ID numérico de la cartera, sin texto adicional, sin formato, sin markdown, sin explicaciones.
- Si ninguna cartera coincide exactamente, elige la más cercana por contexto semántico.
- Si hay múltiples candidatos, elige el más relevante para la transacción.`;

    const wallets = await this.walletsService.findAll(profileId);
    const walletsList = wallets
      .map((wallet) => `${wallet.id}: ${wallet.name}`)
      .join('\n');

    const aiResponse = await this.createResponseModel(
      systemPrompt,
      `Carteras del usuario:\n${walletsList}\n\nNombre de la transacción: "${nameTransaction}"\n\n¿Cuál es el ID de la cartera más adecuada? Responde solo con el número.`,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const content: string = aiResponse.data.choices?.[0]?.message?.content;
    if (!content) {
      return wallets[0]?.id;
    }

    const parsedId = Number(content.trim());
    return isNaN(parsedId) ? wallets[0]?.id : parsedId;
  }
}
