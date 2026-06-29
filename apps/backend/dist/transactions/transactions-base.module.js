"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsBaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_1 = require("@nestjs/bullmq");
const expense_entity_1 = require("./entities/expense.entity");
const earning_entity_1 = require("./entities/earning.entity");
const receipt_entity_1 = require("./entities/receipt.entity");
const expense_service_1 = require("./services/expense.service");
const receipt_service_1 = require("./services/receipt.service");
const earning_service_1 = require("./services/earning.service");
const wallets_module_1 = require("../wallets/wallets.module");
const categories_module_1 = require("../categories/categories.module");
const cloudinary_module_1 = require("../cloudinary/cloudinary.module");
let TransactionsBaseModule = class TransactionsBaseModule {
};
exports.TransactionsBaseModule = TransactionsBaseModule;
exports.TransactionsBaseModule = TransactionsBaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([expense_entity_1.Expense, earning_entity_1.Earning, receipt_entity_1.Receipt]),
            bullmq_1.BullModule.registerQueueAsync({
                name: 'receipt.expense.created',
            }),
            wallets_module_1.WalletsModule,
            categories_module_1.CategoriesModule,
            cloudinary_module_1.CloudinaryModule,
        ],
        providers: [expense_service_1.ExpenseService, receipt_service_1.ReceiptService, earning_service_1.EarningService],
        exports: [expense_service_1.ExpenseService, receipt_service_1.ReceiptService, earning_service_1.EarningService],
    })
], TransactionsBaseModule);
//# sourceMappingURL=transactions-base.module.js.map