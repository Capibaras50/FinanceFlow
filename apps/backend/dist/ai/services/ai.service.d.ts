import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Message } from "../../chat/entities/chat.entity";
import { ToolRegistryService } from "../../financial-tools/services/tool-registry.service";
import { Env } from "../../models/env.model";
import { ExtractDataDto } from "../../transactions/dto/extract-data.dto";
export declare class AiService {
    private configService;
    private toolRegistry;
    constructor(configService: ConfigService<Env>, toolRegistry: ToolRegistryService);
    private buildMessages;
    createResponseModel(systemPrompt: string, userMessage: string, messagesHistory?: Message[], mimeType?: string, imageBase64?: string): Promise<axios.AxiosResponse<any, any, {}>>;
    createChatWithTools(systemPrompt: string, userMessage: string, profileId: number, messagesHistory?: Message[]): Promise<{
        data: any;
        messages: any[];
    }>;
    extractDataReceipt(receipt: string, systemPrompt: string, mimeType: string, userMessage: string): Promise<ExtractDataDto>;
}
