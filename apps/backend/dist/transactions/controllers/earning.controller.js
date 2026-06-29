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
exports.EarningController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const get_user_decorator_1 = require("../../decorators/get-user.decorator");
const earning_service_1 = require("../services/earning.service");
const create_earning_dto_1 = require("../dto/create-earning.dto");
const update_earning_dto_1 = require("../dto/update-earning.dto");
let EarningController = class EarningController {
    earningService;
    constructor(earningService) {
        this.earningService = earningService;
    }
    findAll(profileId) {
        return this.earningService.findAll(profileId);
    }
    findOne(profileId, id) {
        return this.earningService.findOne(id, profileId);
    }
    create(profileId, newEarning) {
        return this.earningService.create(newEarning, profileId);
    }
    update(profileId, updateEarningDto, id) {
        return this.earningService.update(id, updateEarningDto, profileId);
    }
    remove(profileId, id) {
        return this.earningService.remove(id, profileId);
    }
};
exports.EarningController = EarningController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, get_user_decorator_1.GetUser)('profileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EarningController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, get_user_decorator_1.GetUser)('profileId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], EarningController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, get_user_decorator_1.GetUser)('profileId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_earning_dto_1.CreateEarningDto]),
    __metadata("design:returntype", void 0)
], EarningController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, get_user_decorator_1.GetUser)('profileId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_earning_dto_1.UpdateEarningDto, Number]),
    __metadata("design:returntype", void 0)
], EarningController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, get_user_decorator_1.GetUser)('profileId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], EarningController.prototype, "remove", null);
exports.EarningController = EarningController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('earnings'),
    __metadata("design:paramtypes", [earning_service_1.EarningService])
], EarningController);
//# sourceMappingURL=earning.controller.js.map