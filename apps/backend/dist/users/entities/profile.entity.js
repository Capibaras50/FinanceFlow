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
exports.Profile = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const category_entity_1 = require("../../categories/entities/category.entity");
const expense_entity_1 = require("../../transactions/entities/expense.entity");
const earning_entity_1 = require("../../transactions/entities/earning.entity");
const wallets_entity_1 = require("../../wallets/entities/wallets.entity");
const receipt_entity_1 = require("../../transactions/entities/receipt.entity");
let Profile = class Profile {
    id;
    name;
    avatarUrl;
    user;
    categories;
    expenses;
    earnings;
    receipts;
    wallets;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.Profile = Profile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], Profile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: false }),
    __metadata("design:type", String)
], Profile.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'avatar_url', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Profile.prototype, "avatarUrl", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (user) => user.profile, { nullable: false }),
    __metadata("design:type", user_entity_1.User)
], Profile.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => category_entity_1.Category, (category) => category.profile, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], Profile.prototype, "categories", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => expense_entity_1.Expense, (expense) => expense.profile, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], Profile.prototype, "expenses", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => earning_entity_1.Earning, (earning) => earning.profile, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], Profile.prototype, "earnings", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => receipt_entity_1.Receipt, (receipt) => receipt.profile, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], Profile.prototype, "receipts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => wallets_entity_1.Wallet, (wallet) => wallet.profile, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], Profile.prototype, "wallets", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: 'created_at',
        type: 'timestamp with time zone',
        default: () => 'NOW()',
    }),
    __metadata("design:type", Date)
], Profile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        name: 'updated_at',
        type: 'timestamp with time zone',
        default: () => 'NOW()',
    }),
    __metadata("design:type", Date)
], Profile.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({
        name: 'deleted_at',
        type: 'timestamp with time zone',
        nullable: true,
    }),
    __metadata("design:type", Date)
], Profile.prototype, "deletedAt", void 0);
exports.Profile = Profile = __decorate([
    (0, typeorm_1.Entity)('profiles')
], Profile);
//# sourceMappingURL=profile.entity.js.map