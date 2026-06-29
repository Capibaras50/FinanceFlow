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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const class_validator_1 = require("class-validator");
const tool_registry_service_1 = require("../../financial-tools/services/tool-registry.service");
const extract_data_dto_1 = require("../../transactions/dto/extract-data.dto");
let AiService = class AiService {
    configService;
    toolRegistry;
    constructor(configService, toolRegistry) {
        this.configService = configService;
        this.toolRegistry = toolRegistry;
        const aiUrl = this.configService.get('AI_URL', { infer: true });
        if (typeof aiUrl !== 'string' || !aiUrl.startsWith('http://')) {
            throw new Error('Put a Ai Url valid');
        }
    }
    buildMessages(systemPrompt, userMessage, messagesHistory, mimeType, imageBase64) {
        const historyMessages = (messagesHistory ?? [])
            .filter((msg) => msg.message && msg.message.trim().length > 0)
            .map((msg) => ({
            role: msg.role,
            content: msg.message,
        }));
        const messages = [];
        if (systemPrompt && systemPrompt.trim().length > 0) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push(...historyMessages);
        const userContent = [{ type: 'text', text: userMessage }];
        if (mimeType && imageBase64) {
            userContent.push({
                type: 'image_url',
                image_url: {
                    url: `data:${mimeType};base64,${imageBase64}`,
                },
            });
        }
        messages.push({ role: 'user', content: userContent });
        return messages;
    }
    async createResponseModel(systemPrompt, userMessage, messagesHistory, mimeType, imageBase64) {
        try {
            const messages = this.buildMessages(systemPrompt, userMessage, messagesHistory, mimeType, imageBase64);
            const aiUrl = this.configService.get('AI_URL', { infer: true });
            const response = await axios_1.default.post(aiUrl, {
                model: 'google/gemma-4-e2b',
                messages,
                temperature: 0.7,
            }, {
                headers: { 'Content-Type': 'application/json' },
            });
            return response;
        }
        catch {
            throw new common_1.BadRequestException('The Process Of Extract Data Failed');
        }
    }
    async createChatWithTools(systemPrompt, userMessage, profileId, messagesHistory) {
        try {
            const messages = this.buildMessages(systemPrompt, userMessage, messagesHistory);
            const tools = this.toolRegistry.getTools();
            const aiUrl = this.configService.get('AI_URL', { infer: true });
            const firstResponse = await axios_1.default.post(aiUrl, {
                model: 'google/gemma-4-e2b',
                messages,
                tools,
                temperature: 0.7,
            }, {
                headers: { 'Content-Type': 'application/json' },
            });
            const firstChoice = firstResponse.data.choices?.[0];
            const toolCalls = firstChoice?.message?.tool_calls;
            if (!toolCalls || toolCalls.length === 0) {
                return { data: firstResponse.data, messages };
            }
            const toolCallMessage = {
                role: 'assistant',
                content: null,
                tool_calls: toolCalls.map((tc) => ({
                    id: tc.id,
                    type: tc.type,
                    function: tc.function,
                })),
            };
            const toolResults = [];
            for (const tc of toolCalls) {
                const args = JSON.parse(tc.function.arguments);
                const result = await this.toolRegistry.executeTool(tc.function.name, profileId, args);
                toolResults.push({
                    role: 'tool',
                    tool_call_id: tc.id,
                    content: JSON.stringify(result),
                });
            }
            const secondResponse = await axios_1.default.post(aiUrl, {
                model: 'google/gemma-4-e2b',
                messages: [...messages, toolCallMessage, ...toolResults],
                temperature: 0.7,
            }, {
                headers: { 'Content-Type': 'application/json' },
            });
            return { data: secondResponse.data, messages };
        }
        catch (err) {
            console.error(err);
            throw new common_1.BadRequestException('The Process Of Chat With Tools Failed');
        }
    }
    async extractDataReceipt(receipt, systemPrompt, mimeType, userMessage) {
        try {
            const response = await this.createResponseModel(systemPrompt, userMessage, undefined, mimeType, receipt);
            const aiResult = response.data;
            const content = aiResult.choices?.[0]?.message?.content;
            if (!content || !(0, class_validator_1.isString)(content)) {
                throw new common_1.BadRequestException('The Process Of Extract Data Failed');
            }
            const parsedContent = JSON.parse(content);
            const extractDataDto = new extract_data_dto_1.ExtractDataDto();
            if ((0, class_validator_1.isObject)(parsedContent) &&
                'name' in parsedContent &&
                'value' in parsedContent &&
                'description' in parsedContent &&
                'fileName' in parsedContent &&
                'extractionConfidence' in parsedContent &&
                'walletName' in parsedContent &&
                'categoryName' in parsedContent) {
                extractDataDto.name = String(parsedContent.name);
                extractDataDto.value = Number(parsedContent.value);
                extractDataDto.description = String(parsedContent.description);
                extractDataDto.fileName = String(parsedContent.fileName);
                extractDataDto.extractionConfidence = Number(parsedContent.extractionConfidence);
                extractDataDto.walletName = String(parsedContent.walletName);
                extractDataDto.categoryName = String(parsedContent.categoryName);
            }
            const errors = await (0, class_validator_1.validate)(extractDataDto);
            if (errors.length > 0) {
                throw new common_1.BadRequestException('The Process Of Extract Data Failed');
            }
            return extractDataDto;
        }
        catch {
            throw new common_1.BadRequestException('The Process Of Extract Data Failed');
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        tool_registry_service_1.ToolRegistryService])
], AiService);
//# sourceMappingURL=ai.service.js.map