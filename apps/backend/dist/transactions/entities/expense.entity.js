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
exports.Expense = void 0;
const category_entity_1 = require("../../categories/entities/category.entity");
const profile_entity_1 = require("../../users/entities/profile.entity");
const wallets_entity_1 = require("../../wallets/entities/wallets.entity");
const typeorm_1 = require("typeorm");
const receipt_entity_1 = require("./receipt.entity");
let Expense = class Expense {
    id;
    name;
    description;
    value;
    wallet;
    categories;
    profile;
    receipt;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.Expense = Expense;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], Expense.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, nullable: false }),
    __metadata("design:type", String)
], Expense.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Expense.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', nullable: false, precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Expense.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => wallets_entity_1.Wallet, (wallet) => wallet.expenses),
    (0, typeorm_1.JoinColumn)({ name: 'wallet_id' }),
    __metadata("design:type", wallets_entity_1.Wallet)
], Expense.prototype, "wallet", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => category_entity_1.Category, (category) => category.expenses),
    (0, typeorm_1.JoinTable)({
        name: 'expense_categories',
        joinColumn: { name: 'expense_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Expense.prototype, "categories", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profile_entity_1.Profile, (profile) => profile.expenses),
    (0, typeorm_1.JoinColumn)({ name: 'profile_id', referencedColumnName: 'id' }),
    __metadata("design:type", profile_entity_1.Profile)
], Expense.prototype, "profile", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => receipt_entity_1.Receipt, (receipt) => receipt.expense, { nullable: true }),
    __metadata("design:type", receipt_entity_1.Receipt)
], Expense.prototype, "receipt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: 'created_at',
        type: 'timestamp with time zone',
        default: () => 'NOW()',
    }),
    __metadata("design:type", Date)
], Expense.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        name: 'updated_at',
        type: 'timestamp with time zone',
        default: () => 'NOW()',
    }),
    __metadata("design:type", Date)
], Expense.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({
        name: 'deleted_at',
        type: 'timestamp with time zone',
        nullable: true,
    }),
    __metadata("design:type", Date)
], Expense.prototype, "deletedAt", void 0);
exports.Expense = Expense = __decorate([
    (0, typeorm_1.Entity)('expenses')
], Expense);
//# sourceMappingURL=expense.entity.js.map