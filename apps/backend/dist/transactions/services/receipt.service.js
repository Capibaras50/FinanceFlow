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
exports.ReceiptService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const receipt_entity_1 = require("../entities/receipt.entity");
const typeorm_2 = require("typeorm");
const cloudinary_service_1 = require("../../cloudinary/services/cloudinary.service");
const wallets_service_1 = require("../../wallets/services/wallets.service");
const categories_service_1 = require("../../categories/services/categories.service");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let ReceiptService = class ReceiptService {
    receiptRepository;
    cloudinaryService;
    walletService;
    categoriesService;
    queue;
    constructor(receiptRepository, cloudinaryService, walletService, categoriesService, queue) {
        this.receiptRepository = receiptRepository;
        this.cloudinaryService = cloudinaryService;
        this.walletService = walletService;
        this.categoriesService = categoriesService;
        this.queue = queue;
    }
    async findOne(id, profileId) {
        const receipt = await this.receiptRepository.findOne({
            where: {
                profile: { id: profileId },
                id,
            },
        });
        if (!receipt) {
            throw new common_1.NotFoundException('The Receipt Not Found');
        }
        return receipt;
    }
    async findAll(profileId) {
        const receipts = await this.receiptRepository.find({
            where: {
                profile: { id: profileId },
            },
        });
        return receipts;
    }
    async create(receiptUrl, profileId) {
        try {
            const wallets = await this.walletService.findAll(profileId);
            const categories = await this.categoriesService.findAll(profileId);
            const systemPrompt = `Eres un asistente experto en extracción de datos de recibos y facturas. Analiza la imagen y extrae ÚNICAMENTE un objeto JSON con esta estructura exacta, sin texto adicional ni formato markdown:
      {
        "fileName": "nombre del comercio junto con la fecha del dia",
        "name": "nombre del comercio o establecimiento",
        "value": monto_total_numerico,
        "description": "descripción de los items o servicios",
        "extractionConfidence": porcentaje_de_confianza_0_100,
        "walletName": "posible nombre del bolsillo al que se agregara el gasto los principales bolsillos son los siguientes: ${wallets.map((wallet) => wallet.name).join(', ')}",
        "categoryName": "posible nombre de la categoria a la que pertenece el gasto las principales categorias son las siguientes: ${categories.map((category) => category.name).join(', ')}"
      }`;
            const userMessage = 'Extrae la informacion del siguiente recibo';
            const { mimeType, base64, sizeBytes } = await this.cloudinaryService.getFileAsBase64(receiptUrl);
            await this.queue.add('create-receipt', {
                profileId,
                sizeBytes,
                mimeType,
                receiptUrl,
                systemPrompt,
                base64,
                userMessage,
            }, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnFail: false,
                removeOnComplete: true,
            });
            return { message: 'Start to process the Receipt' };
        }
        catch (err) {
            console.error(err);
            throw new common_1.BadRequestException('The receipt dont could be created');
        }
    }
    async remove(id, profileId) {
        const receipt = await this.findOne(id, profileId);
        await this.receiptRepository.delete({
            id: receipt.id,
            profile: { id: profileId },
        });
        return { id: receipt.id };
    }
};
exports.ReceiptService = ReceiptService;
exports.ReceiptService = ReceiptService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(receipt_entity_1.Receipt)),
    __param(4, (0, bullmq_1.InjectQueue)('receipt.expense.created')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        cloudinary_service_1.CloudinaryService,
        wallets_service_1.WalletsService,
        categories_service_1.CategoriesService,
        bullmq_2.Queue])
], ReceiptService);
//# sourceMappingURL=receipt.service.js.map