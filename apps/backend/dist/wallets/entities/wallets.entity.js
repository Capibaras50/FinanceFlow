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
exports.Wallet = void 0;
const earning_entity_1 = require("../../transactions/entities/earning.entity");
const expense_entity_1 = require("../../transactions/entities/expense.entity");
const profile_entity_1 = require("../../users/entities/profile.entity");
const typeorm_1 = require("typeorm");
let Wallet = class Wallet {
    id;
    name;
    profile;
    earnings;
    expenses;
    createdAt;
    updatedAt;
};
exports.Wallet = Wallet;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], Wallet.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, nullable: false }),
    __metadata("design:type", String)
], Wallet.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profile_entity_1.Profile, (profile) => profile.wallets),
    (0, typeorm_1.JoinColumn)({ name: 'profile_id' }),
    __metadata("design:type", profile_entity_1.Profile)
], Wallet.prototype, "profile", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => earning_entity_1.Earning, (earning) => earning.wallet, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], Wallet.prototype, "earnings", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => expense_entity_1.Expense, (expense) => expense.wallet, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], Wallet.prototype, "expenses", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: 'created_at',
        type: 'timestamp with time zone',
        default: () => 'NOW()',
    }),
    __metadata("design:type", Date)
], Wallet.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        name: 'updated_at',
        type: 'timestamp with time zone',
        default: () => 'NOW()',
    }),
    __metadata("design:type", Date)
], Wallet.prototype, "updatedAt", void 0);
exports.Wallet = Wallet = __decorate([
    (0, typeorm_1.Unique)(['name', 'profile']),
    (0, typeorm_1.Entity)('wallets')
], Wallet);
//# sourceMappingURL=wallets.entity.js.map