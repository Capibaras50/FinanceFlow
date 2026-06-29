import { ChatService } from '../services/chat.service';
import { CreateChatDto } from '../dto/create-chat.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    create(createChatDto: CreateChatDto, profileId: number): Promise<import("../entities/chat.entity").Message>;
    getRecord(profileId: number, take?: number): Promise<import("../entities/chat.entity").Message[]>;
    remove(id: number, profileId: number): Promise<import("../entities/chat.entity").Message>;
}
