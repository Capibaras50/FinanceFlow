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
exports.EarningService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const earning_entity_1 = require("../entities/earning.entity");
const wallets_service_1 = require("../../wallets/services/wallets.service");
const categories_service_1 = require("../../categories/services/categories.service");
let EarningService = class EarningService {
    earningRepository;
    walletsService;
    categoriesService;
    constructor(earningRepository, walletsService, categoriesService) {
        this.earningRepository = earningRepository;
        this.walletsService = walletsService;
        this.categoriesService = categoriesService;
    }
    async findAll(profileId) {
        try {
            const earnings = await this.earningRepository.find({
                where: {
                    profile: { id: profileId },
                    deletedAt: undefined,
                },
                relations: ['categories', 'wallet'],
            });
            return earnings;
        }
        catch {
            throw new common_1.BadRequestException('Couldnt Get Anyone Earning');
        }
    }
    async findOne(id, profileId) {
        try {
            const earning = await this.earningRepository.findOne({
                where: {
                    id,
                    profile: { id: profileId },
                    deletedAt: undefined,
                },
                relations: ['categories', 'wallet'],
            });
            if (!earning) {
                throw new common_1.NotFoundException('The earning Not Found');
            }
            return earning;
        }
        catch {
            throw new common_1.BadRequestException('Couldnt Search The Earning');
        }
    }
    async getTotalEarnings(profileId, month) {
        const totalEarnings = await this.earningRepository
            .createQueryBuilder('earnings')
            .select('COALESCE(SUM(earnings.value), 0)', 'totalEarnings')
            .addSelect('COUNT(earnings.id)', 'numEarnings')
            .where('earnings.profile.id = :profileId', { profileId, month })
            .andWhere('EXTRACT(MONTH FROM earnings.createdAt) = :month', { month })
            .andWhere('earnings.deletedAt IS NULL')
            .getRawOne();
        return totalEarnings;
    }
    async create(newEarning, profileId) {
        try {
            const earning = {
                ...newEarning,
                wallet: { id: newEarning.walletId },
                categories: newEarning.categoriesId.map((id) => ({ id })),
                profile: { id: profileId },
            };
            const createdEarning = this.earningRepository.create(earning);
            return await this.earningRepository.save(createdEarning);
        }
        catch {
            throw new common_1.BadRequestException('The Earning Couldnt Be Created');
        }
    }
    async update(id, updateEarningDto, profileId) {
        try {
            const changes = {};
            const earning = await this.findOne(id, profileId);
            if (updateEarningDto.name !== undefined) {
                changes.name = updateEarningDto.name;
            }
            if (updateEarningDto.description !== undefined) {
                changes.description = updateEarningDto.description;
            }
            if (updateEarningDto.value !== undefined) {
                changes.value = updateEarningDto.value;
            }
            if (updateEarningDto.walletId !== undefined) {
                const wallet = await this.walletsService.findOne(updateEarningDto.walletId, profileId);
                changes.wallet = { id: wallet.id };
            }
            if (updateEarningDto.categoriesId !== undefined) {
                const categories = await this.categoriesService.findByIds(updateEarningDto.categoriesId, profileId);
                changes.categories = categories;
            }
            const mergedEarning = this.earningRepository.merge(earning, changes);
            return await this.earningRepository.save(mergedEarning);
        }
        catch {
            throw new common_1.BadRequestException('The Earning Couldnt Be Updated');
        }
    }
    async remove(id, profileId) {
        try {
            const earning = await this.findOne(id, profileId);
            const mergedEarning = this.earningRepository.merge(earning, {
                deletedAt: new Date(),
            });
            return this.earningRepository.save(mergedEarning);
        }
        catch {
            throw new common_1.BadRequestException('The Earning Couldnt Be Removed');
        }
    }
};
exports.EarningService = EarningService;
exports.EarningService = EarningService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(earning_entity_1.Earning)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        wallets_service_1.WalletsService,
        categories_service_1.CategoriesService])
], EarningService);
//# sourceMappingURL=earning.service.js.map