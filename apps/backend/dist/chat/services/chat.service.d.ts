import { CreateChatDto } from '../dto/create-chat.dto';
import { Message } from '../entities/chat.entity';
import { Repository } from 'typeorm';
import { AiService } from "../../ai/services/ai.service";
export declare class ChatService {
    private messagesRepository;
    private aiService;
    constructor(messagesRepository: Repository<Message>, aiService: AiService);
    sendMessage(createChatDto: CreateChatDto, profileId: number): Promise<Message>;
    findAllMessages(profileId: number, take?: number): Promise<Message[]>;
    removeMessage(id: number, profileId: number): Promise<Message>;
}
