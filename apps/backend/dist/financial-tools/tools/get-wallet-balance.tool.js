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
exports.GetWalletBalanceTool = void 0;
const common_1 = require("@nestjs/common");
const financial_tools_service_1 = require("../services/financial-tools.service");
let GetWalletBalanceTool = class GetWalletBalanceTool {
    financialToolsService;
    constructor(financialToolsService) {
        this.financialToolsService = financialToolsService;
    }
    name = 'getWalletBalance';
    description = 'Returns the balance (expenses, earnings, and net) for all wallets or a specific wallet by ID';
    parameters = {
        type: 'object',
        properties: {
            id: {
                type: 'number',
                description: 'Optional wallet ID. If omitted, returns balances for all wallets',
            },
        },
        required: [],
    };
    async execute(profileId, args) {
        return await this.financialToolsService.getWalletBalance(profileId, args.id);
    }
};
exports.GetWalletBalanceTool = GetWalletBalanceTool;
exports.GetWalletBalanceTool = GetWalletBalanceTool = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [financial_tools_service_1.FinancialToolsService])
], GetWalletBalanceTool);
//# sourceMappingURL=get-wallet-balance.tool.js.map