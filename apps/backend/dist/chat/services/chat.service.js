"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const chat_entity_1 = require("../entities/chat.entity");
const typeorm_2 = require("typeorm");
const role_enum_1 = require("../enums/role.enum");
const ai_service_1 = require("../../ai/services/ai.service");
let ChatService = class ChatService {
    messagesRepository;
    aiService;
    constructor(messagesRepository, aiService) {
        this.messagesRepository = messagesRepository;
        this.aiService = aiService;
    }
    async sendMessage(createChatDto, profileId) {
        try {
            const systemPrompt = `Eres un asistente financiero inteligente y amigable que ayuda a los usuarios a gestionar sus finanzas personales. Hablas solo en español. Puedes consultar gastos, ingresos, carteras, categorías y recibos del usuario usando las herramientas disponibles. Responde de forma clara, concisa y útil. Usa markdown para formatear tus respuestas cuando sea apropiado (negritas, listas, títulos).`;
            const messagesHistory = await this.findAllMessages(profileId, 10);
            const newUserMessage = {
                role: role_enum_1.RoleEnum.USER,
                message: createChatDto.message,
                profile: { id: profileId },
            };
            const createdUserMessage = this.messagesRepository.create(newUserMessage);
            const savedUserMessage = await this.messagesRepository.save(createdUserMessage);
            const response = await this.aiService.createChatWithTools(systemPrompt, savedUserMessage.message, profileId, messagesHistory);
            const assitantMessage = response.data?.choices[0]?.message;
            const newAssistantMessage = {
                role: assitantMessage.role,
                message: assitantMessage.content,
                profile: { id: profileId },
            };
            const createdAssistantMessage = this.messagesRepository.create(newAssistantMessage);
            return await this.messagesRepository.save(createdAssistantMessage);
        }
        catch {
            throw new common_1.BadRequestException('The Message Couldnt Be Sent');
        }
    }
    async findAllMessages(profileId, take) {
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
    async removeMessage(id, profileId) {
        const message = await this.messagesRepository.findOne({
            where: {
                deletedAt: undefined,
                id,
                profile: { id: profileId },
            },
        });
        if (!message) {
            throw new common_1.NotFoundException('The Message Not Found');
        }
        const mergedMessage = this.messagesRepository.merge(message, {
            deletedAt: new Date(),
        });
        return await this.messagesRepository.save(mergedMessage);
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chat_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        ai_service_1.AiService])
], ChatService);
//# sourceMappingURL=chat.service.js.map