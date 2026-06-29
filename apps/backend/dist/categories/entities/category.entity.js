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
exports.Category = void 0;
const earning_entity_1 = require("../../transactions/entities/earning.entity");
const expense_entity_1 = require("../../transactions/entities/expense.entity");
const profile_entity_1 = require("../../users/entities/profile.entity");
const typeorm_1 = require("typeorm");
let Category = class Category {
    id;
    name;
    description;
    color;
    profile;
    earnings;
    expenses;
    createdAt;
    updatedAt;
};
exports.Category = Category;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], Category.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: false }),
    __metadata("design:type", String)
], Category.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Category.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 7, nullable: false }),
    __metadata("design:type", String)
], Category.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profile_entity_1.Profile, (profile) => profile.categories),
    (0, typeorm_1.JoinColumn)({ name: 'profile_id', referencedColumnName: 'id' }),
    __metadata("design:type", profile_entity_1.Profile)
], Category.prototype, "profile", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => earning_entity_1.Earning, (earning) => earning.categories),
    __metadata("design:type", Array)
], Category.prototype, "earnings", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => expense_entity_1.Expense, (expense) => expense.categories),
    __metadata("design:type", Array)
], Category.prototype, "expenses", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: 'created_at',
        type: 'timestamp with time zone',
        default: () => 'NOW()',
    }),
    __metadata("design:type", Date)
], Category.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        name: 'updated_at',
        type: 'timestamp with time zone',
        default: () => 'NOW()',
    }),
    __metadata("design:type", Date)
], Category.prototype, "updatedAt", void 0);
exports.Category = Category = __decorate([
    (0, typeorm_1.Entity)('categories'),
    (0, typeorm_1.Unique)(['name', 'profile'])
], Category);
//# sourceMappingURL=category.entity.js.map