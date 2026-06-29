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
exports.ReceiptController = void 0;
const common_1 = require("@nestjs/common");
const receipt_service_1 = require("../services/receipt.service");
const passport_1 = require("@nestjs/passport");
const get_user_decorator_1 = require("../../decorators/get-user.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const cloudinary_service_1 = require("../../cloudinary/services/cloudinary.service");
let ReceiptController = class ReceiptController {
    receiptService;
    cloudinaryService;
    constructor(receiptService, cloudinaryService) {
        this.receiptService = receiptService;
        this.cloudinaryService = cloudinaryService;
    }
    findOne(id, profileId) {
        return this.receiptService.findOne(id, profileId);
    }
    findAll(profileId) {
        return this.receiptService.findAll(profileId);
    }
    async create(profileId, receipt) {
        if (!receipt) {
            throw new common_1.BadRequestException('Receipt file is required');
        }
        const receiptUrl = (await this.cloudinaryService.uploadFile(receipt));
        return this.receiptService.create(receiptUrl, profileId);
    }
    remove(id, profileId) {
        return this.receiptService.remove(id, profileId);
    }
};
exports.ReceiptController = ReceiptController;
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ReceiptController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, get_user_decorator_1.GetUser)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReceiptController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('receipt')),
    __param(0, (0, get_user_decorator_1.GetUser)('profileId')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ReceiptController.prototype, "create", null);
__decorate([
    (0, common_1.HttpCode)(204),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ReceiptController.prototype, "remove", null);
exports.ReceiptController = ReceiptController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('receipts'),
    __metadata("design:paramtypes", [receipt_service_1.ReceiptService,
        cloudinary_service_1.CloudinaryService])
], ReceiptController);
//# sourceMappingURL=receipt.controller.js.map