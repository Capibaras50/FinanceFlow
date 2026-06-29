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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const ai_service_1 = require("../../ai/services/ai.service");
const expense_service_1 = require("../services/expense.service");
let ReceiptProcessor = class ReceiptProcessor extends bullmq_1.WorkerHost {
    aiService;
    expenseService;
    constructor(aiService, expenseService) {
        super();
        this.aiService = aiService;
        this.expenseService = expenseService;
    }
    async process(job) {
        switch (job.name) {
            case 'create-receipt':
                return this.createReceipt(job);
            default:
                throw new Error(`Job no soportado: ${job.name}`);
        }
    }
    async createReceipt(job) {
        const { profileId, receiptUrl, base64, systemPrompt, mimeType, userMessage, sizeBytes, } = job.data;
        await job.updateProgress(30);
        console.log(`Processing Receipt: ${receiptUrl}`);
        const extractedData = await this.aiService.extractDataReceipt(base64, systemPrompt, mimeType, userMessage);
        await job.updateProgress(65);
        await this.expenseService.createExpenseFromReceipt(extractedData.name, extractedData.description, extractedData.value, extractedData.walletName, extractedData.categoryName, profileId, extractedData.fileName, sizeBytes, mimeType, receiptUrl, extractedData.extractionConfidence, job.id, job.attemptsMade, undefined);
        console.log(`Processed Receipt: ${receiptUrl}`);
        await job.updateProgress(100);
    }
};
exports.ReceiptProcessor = ReceiptProcessor;
exports.ReceiptProcessor = ReceiptProcessor = __decorate([
    (0, bullmq_1.Processor)('receipt.expense.created'),
    __metadata("design:paramtypes", [ai_service_1.AiService,
        expense_service_1.ExpenseService])
], ReceiptProcessor);
//# sourceMappingURL=receipt.processor.js.map