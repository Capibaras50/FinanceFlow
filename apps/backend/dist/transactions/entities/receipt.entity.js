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
exports.Receipt = void 0;
const profile_entity_1 = require("../../users/entities/profile.entity");
const typeorm_1 = require("typeorm");
const receipt_enums_1 = require("../enums/receipt.enums");
const expense_entity_1 = require("./expense.entity");
let Receipt = class Receipt {
    id;
    profile;
    fileUrl;
    fileName;
    fileSizeBytes;
    mimeType;
    status;
    jobId;
    attempts;
    lastError;
    extractionConfidence;
    expense;
    createdAt;
    updatedAt;
    processedAt;
};
exports.Receipt = Receipt;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], Receipt.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profile_entity_1.Profile, (profile) => profile.receipts),
    (0, typeorm_1.JoinColumn)({ name: 'profile_id' }),
    __metadata("design:type", profile_entity_1.Profile)
], Receipt.prototype, "profile", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'file_url', nullable: false }),
    __metadata("design:type", String)
], Receipt.prototype, "fileUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'file_name', nullable: true }),
    __metadata("design:type", String)
], Receipt.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', name: 'file_size_bytes', nullable: true }),
    __metadata("design:type", Number)
], Receipt.prototype, "fileSizeBytes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'mime_type', nullable: true }),
    __metadata("design:type", String)
], Receipt.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        nullable: false,
        default: 'pending',
        enum: receipt_enums_1.ReceiptStatus,
    }),
    __metadata("design:type", String)
], Receipt.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'job_id' }),
    __metadata("design:type", String)
], Receipt.prototype, "jobId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: false, default: 0 }),
    __metadata("design:type", Number)
], Receipt.prototype, "attempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'last_error' }),
    __metadata("design:type", String)
], Receipt.prototype, "lastError", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true, name: 'extraction_confidence' }),
    __metadata("design:type", Number)
], Receipt.prototype, "extractionConfidence", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => expense_entity_1.Expense, (expense) => expense.receipt, {
        onDelete: 'CASCADE',
        cascade: true,
        nullable: false,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'expense_id', referencedColumnName: 'id' }),
    __metadata("design:type", expense_entity_1.Expense)
], Receipt.prototype, "expense", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: 'timestamp with time zone',
        name: 'created_at',
        default: () => 'NOW()',
    }),
    __metadata("design:type", Date)
], Receipt.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: 'timestamp with time zone',
        name: 'updated_at',
        default: () => 'NOW()',
    }),
    __metadata("design:type", Date)
], Receipt.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'timestamp with time zone',
        name: 'processed_at',
        nullable: true,
    }),
    __metadata("design:type", Date)
], Receipt.prototype, "processedAt", void 0);
exports.Receipt = Receipt = __decorate([
    (0, typeorm_1.Entity)('receipts')
], Receipt);
//# sourceMappingURL=receipt.entity.js.map