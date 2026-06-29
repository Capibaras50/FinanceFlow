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
exports.GetTopCategoriesTool = void 0;
const common_1 = require("@nestjs/common");
const financial_tools_service_1 = require("../services/financial-tools.service");
let GetTopCategoriesTool = class GetTopCategoriesTool {
    financialToolsService;
    constructor(financialToolsService) {
        this.financialToolsService = financialToolsService;
    }
    name = 'getTopCategories';
    description = 'Returns the top spending categories ranked by total expense value';
    parameters = {
        type: 'object',
        properties: {
            take: {
                type: 'number',
                description: 'Number of top categories to return',
            },
        },
        required: ['take'],
    };
    async execute(profileId, args) {
        return await this.financialToolsService.getTopCategories(profileId, args.take);
    }
};
exports.GetTopCategoriesTool = GetTopCategoriesTool;
exports.GetTopCategoriesTool = GetTopCategoriesTool = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [financial_tools_service_1.FinancialToolsService])
], GetTopCategoriesTool);
//# sourceMappingURL=get-top-categories.tool.js.map