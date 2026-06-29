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
exports.GetCategoryByIdTool = void 0;
const common_1 = require("@nestjs/common");
const financial_tools_service_1 = require("../services/financial-tools.service");
let GetCategoryByIdTool = class GetCategoryByIdTool {
    financialToolsService;
    constructor(financialToolsService) {
        this.financialToolsService = financialToolsService;
    }
    name = 'getCategoryById';
    description = 'Returns a category of the authenticated user by its ID';
    parameters = {
        type: 'object',
        properties: {
            id: {
                type: 'number',
                description: 'The ID of the category to retrieve',
            },
        },
        required: ['id'],
    };
    async execute(profileId, args) {
        return await this.financialToolsService.getCategoryById(args.id, profileId);
    }
};
exports.GetCategoryByIdTool = GetCategoryByIdTool;
exports.GetCategoryByIdTool = GetCategoryByIdTool = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [financial_tools_service_1.FinancialToolsService])
], GetCategoryByIdTool);
//# sourceMappingURL=get-category-by-id.tool.js.map