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
exports.GetCategoryByNameTool = void 0;
const common_1 = require("@nestjs/common");
const financial_tools_service_1 = require("../services/financial-tools.service");
let GetCategoryByNameTool = class GetCategoryByNameTool {
    financialToolsService;
    constructor(financialToolsService) {
        this.financialToolsService = financialToolsService;
    }
    name = 'getCategoryByName';
    description = 'Returns categories whose name includes the given text';
    parameters = {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                description: 'Full or partial category name to search for',
            },
        },
        required: ['name'],
    };
    async execute(profileId, args) {
        return await this.financialToolsService.getCategoryByName(args.name, profileId);
    }
};
exports.GetCategoryByNameTool = GetCategoryByNameTool;
exports.GetCategoryByNameTool = GetCategoryByNameTool = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [financial_tools_service_1.FinancialToolsService])
], GetCategoryByNameTool);
//# sourceMappingURL=get-category-by-name.tool.js.map