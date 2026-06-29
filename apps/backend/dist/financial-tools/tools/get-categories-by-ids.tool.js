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
exports.GetCategoriesByIdsTool = void 0;
const common_1 = require("@nestjs/common");
const financial_tools_service_1 = require("../services/financial-tools.service");
let GetCategoriesByIdsTool = class GetCategoriesByIdsTool {
    financialToolsService;
    constructor(financialToolsService) {
        this.financialToolsService = financialToolsService;
    }
    name = 'getCategoriesByIds';
    description = 'Returns One Category For Each Id Of the Array In The Args';
    parameters = {
        type: 'object',
        properties: {
            ids: {
                type: 'array',
                description: 'An array of category IDs to retrieve',
                items: { type: 'number' },
            },
        },
        required: ['ids'],
    };
    async execute(profileId, args) {
        return await this.financialToolsService.getCategoriesByIds(args.ids, profileId);
    }
};
exports.GetCategoriesByIdsTool = GetCategoriesByIdsTool;
exports.GetCategoriesByIdsTool = GetCategoriesByIdsTool = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [financial_tools_service_1.FinancialToolsService])
], GetCategoriesByIdsTool);
//# sourceMappingURL=get-categories-by-ids.tool.js.map