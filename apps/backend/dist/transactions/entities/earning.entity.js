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
exports.Earning = void 0;
const category_entity_1 = require("../../categories/entities/category.entity");
const profile_entity_1 = require("../../users/entities/profile.entity");
const wallets_entity_1 = require("../../wallets/entities/wallets.entity");
const typeorm_1 = require("typeorm");
let Earning = class Earning {
    id;
    name;
    description;
    value;
    wallet;
    categories;
    profile;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.Earning = Earning;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], Earning.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, nullable: false }),
    __metadata("design:type", String)
], Earning.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Earning.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', nullable: false, precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Earning.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => wallets_entity_1.Wallet, (wallet) => wallet.earnings),
    (0, typeorm_1.JoinColumn)({ name: 'wallet_id' }),
    __metadata("design:type", wallets_entity_1.Wallet)
], Earning.prototype, "wallet", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => category_entity_1.Category, (category) => category.earnings),
    (0, typeorm_1.JoinTable)({
        name: 'earning_categories',
        joinColumn: { name: 'earning_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Earning.prototype, "categories", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profile_entity_1.Profile, (profile) => profile.earnings),
    (0, typeorm_1.JoinColumn)({ name: 'profile_id' }),
    __metadata("design:type", profile_entity_1.Profile)
], Earning.prototype, "profile", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: 'created_at',
        type: 'timestamp with time zone',
        default: () => 'NOW()',
    }),
    __metadata("design:type", Date)
], Earning.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        name: 'updated_at',
        type: 'timestamp with time zone',
        default: () => 'NOW()',
    }),
    __metadata("design:type", Date)
], Earning.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({
        name: 'deleted_at',
        type: 'timestamp with time zone',
        nullable: true,
    }),
    __metadata("design:type", Date)
], Earning.prototype, "deletedAt", void 0);
exports.Earning = Earning = __decorate([
    (0, typeorm_1.Entity)('earnings')
], Earning);
//# sourceMappingURL=earning.entity.js.map