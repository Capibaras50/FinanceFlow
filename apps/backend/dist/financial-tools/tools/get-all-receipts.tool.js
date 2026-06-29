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
exports.GetAllReceiptsTool = void 0;
const common_1 = require("@nestjs/common");
const financial_tools_service_1 = require("../services/financial-tools.service");
let GetAllReceiptsTool = class GetAllReceiptsTool {
    financialToolsService;
    constructor(financialToolsService) {
        this.financialToolsService = financialToolsService;
    }
    name = 'getAllReceipts';
    description = 'Returns all receipts of the authenticated user.';
    parameters = {
        type: 'object',
        properties: {},
        required: [],
    };
    async execute(profileId) {
        return await this.financialToolsService.getAllReceipts(profileId);
    }
};
exports.GetAllReceiptsTool = GetAllReceiptsTool;
exports.GetAllReceiptsTool = GetAllReceiptsTool = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [financial_tools_service_1.FinancialToolsService])
], GetAllReceiptsTool);
//# sourceMappingURL=get-all-receipts.tool.js.map