"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsModule = void 0;
const common_1 = require("@nestjs/common");
const transactions_base_module_1 = require("./transactions-base.module");
const expense_controller_1 = require("./controllers/expense.controller");
const receipt_controller_1 = require("./controllers/receipt.controller");
const earning_controller_1 = require("./controllers/earning.controller");
const receipt_processor_1 = require("./processors/receipt.processor");
const ai_module_1 = require("../ai/ai.module");
const cloudinary_module_1 = require("../cloudinary/cloudinary.module");
let TransactionsModule = class TransactionsModule {
};
exports.TransactionsModule = TransactionsModule;
exports.TransactionsModule = TransactionsModule = __decorate([
    (0, common_1.Module)({
        imports: [transactions_base_module_1.TransactionsBaseModule, ai_module_1.AiModule, cloudinary_module_1.CloudinaryModule],
        controllers: [expense_controller_1.ExpenseController, receipt_controller_1.ReceiptController, earning_controller_1.EarningController],
        providers: [receipt_processor_1.ReceiptProcessor],
        exports: [transactions_base_module_1.TransactionsBaseModule],
    })
], TransactionsModule);
//# sourceMappingURL=transactions.module.js.map