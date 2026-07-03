import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateChatDto } from '../dto/create-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from '../entities/chat.entity';
import { DeepPartial, Repository } from 'typeorm';
import { RoleEnum } from '../enums/role.enum';
import { AiService } from 'src/ai/services/ai.service';
import { AssistantMessageInterface } from '../interfaces/assistant-message.interface';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private aiService: AiService,
  ) {}

  async sendMessage(createChatDto: CreateChatDto, profileId: number) {
    try {
      const timezone = createChatDto.timezone;
      const timezoneInstruction = timezone
        ? `El usuario está en la zona horaria "${timezone}". Cuando muestres fechas, conviértelas siempre a esta zona horaria. Por ejemplo, si ves "2026-07-03T14:30:00.000Z" y el usuario está en "America/Mexico_City" (UTC-6), debes mostrarlo como "3 de julio de 2026, 08:30".`
        : '';
      const systemPrompt = `Eres un asistente financiero inteligente y amigable que ayuda a los usuarios a gestionar sus finanzas personales. Hablas solo en español. Puedes consultar gastos, ingresos, carteras, categorías y recibos del usuario usando las herramientas disponibles. Responde de forma clara, concisa y útil. Usa markdown para formatear tus respuestas cuando sea apropiado (negritas, listas, títulos).${timezoneInstruction ? `\n\n${timezoneInstruction}` : ''}`;
      const messagesHistory = await this.findAllMessages(profileId, 10);
      const newUserMessage: DeepPartial<Message> = {
        role: RoleEnum.USER,
        message: createChatDto.message,
        profile: { id: profileId },
      };
      const createdUserMessage = this.messagesRepository.create(newUserMessage);
      const savedUserMessage =
        await this.messagesRepository.save(createdUserMessage);
      const response = await this.aiService.createChatWithTools(
        systemPrompt,
        savedUserMessage.message,
        profileId,
        messagesHistory,
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const assitantMessage: AssistantMessageInterface =
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        response.data?.choices[0]?.message;
      const newAssistantMessage: DeepPartial<Message> = {
        role: assitantMessage.role,
        message: assitantMessage.content,
        profile: { id: profileId },
      };
      const createdAssistantMessage =
        this.messagesRepository.create(newAssistantMessage);
      return await this.messagesRepository.save(createdAssistantMessage);
    } catch {
      throw new BadRequestException('The Message Couldnt Be Sent');
    }
  }

  async findAllMessages(profileId: number, take?: number) {
    const messagesHistory = await this.messagesRepository.find({
      select: ['id', 'message', 'role', 'createdAt'],
      where: {
        profile: { id: profileId },
        deletedAt: undefined,
      },
      order: {
        createdAt: 'DESC',
      },
      take: take ?? 10,
    });
    return messagesHistory;
  }

  async removeMessage(id: number, profileId: number) {
    const message = await this.messagesRepository.findOne({
      where: {
        deletedAt: undefined,
        id,
        profile: { id: profileId },
      },
    });
    if (!message) {
      throw new NotFoundException('The Message Not Found');
    }
    const mergedMessage = this.messagesRepository.merge(message, {
      deletedAt: new Date(),
    });
    return await this.messagesRepository.save(mergedMessage);
  }
}
