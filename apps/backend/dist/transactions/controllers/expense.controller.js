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
exports.ExpenseController = void 0;
const common_1 = require("@nestjs/common");
const expense_service_1 = require("../services/expense.service");
const passport_1 = require("@nestjs/passport");
const get_user_decorator_1 = require("../../decorators/get-user.decorator");
const create_expense_dto_1 = require("../dto/create-expense.dto");
const update_expense_dto_1 = require("../dto/update-expense.dto");
let ExpenseController = class ExpenseController {
    expenseService;
    constructor(expenseService) {
        this.expenseService = expenseService;
    }
    findOne(profileId, id) {
        return this.expenseService.findOne(id, profileId);
    }
    findAll(profileId) {
        return this.expenseService.findAll(profileId);
    }
    create(profileId, newExpense) {
        return this.expenseService.create(newExpense, profileId);
    }
    update(profileId, changes, id) {
        return this.expenseService.update(id, profileId, changes);
    }
    remove(profileId, id) {
        return this.expenseService.remove(id, profileId);
    }
};
exports.ExpenseController = ExpenseController;
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, get_user_decorator_1.GetUser)('profileId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ExpenseController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, get_user_decorator_1.GetUser)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ExpenseController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, get_user_decorator_1.GetUser)('profileId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_expense_dto_1.CreateExpenseDto]),
    __metadata("design:returntype", void 0)
], ExpenseController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, get_user_decorator_1.GetUser)('profileId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_expense_dto_1.UpdateExpenseDto, Number]),
    __metadata("design:returntype", void 0)
], ExpenseController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, get_user_decorator_1.GetUser)('profileId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ExpenseController.prototype, "remove", null);
exports.ExpenseController = ExpenseController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('expenses'),
    __metadata("design:paramtypes", [expense_service_1.ExpenseService])
], ExpenseController);
//# sourceMappingURL=expense.controller.js.map