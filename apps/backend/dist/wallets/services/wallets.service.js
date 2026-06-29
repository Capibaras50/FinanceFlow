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
exports.WalletsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const wallets_entity_1 = require("../entities/wallets.entity");
const typeorm_2 = require("typeorm");
let WalletsService = class WalletsService {
    walletRepository;
    constructor(walletRepository) {
        this.walletRepository = walletRepository;
    }
    async create(CreateWalletDto, profileId) {
        try {
            const newWallet = {
                ...CreateWalletDto,
                profile: { id: profileId },
            };
            const createdWallet = this.walletRepository.create(newWallet);
            const savedWallet = await this.walletRepository.save(createdWallet);
            return savedWallet;
        }
        catch {
            throw new common_1.BadRequestException('The Wallet Could not be created');
        }
    }
    async findAll(profileId) {
        const wallets = await this.walletRepository.find({
            where: { profile: { id: profileId } },
        });
        return wallets;
    }
    async findOne(id, profileId) {
        const wallet = await this.walletRepository.findOne({
            where: {
                profile: { id: profileId },
                id,
            },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('The Wallet Not Found');
        }
        return wallet;
    }
    async findByName(name, profileId) {
        const wallets = await this.findAll(profileId);
        const filteredWallets = wallets.filter((wallet) => wallet.name.toLowerCase().includes(name.toLowerCase()));
        return filteredWallets[0]?.id ?? wallets[0]?.id;
    }
    async getWalletBalance(profileId, id) {
        const expensesQuery = this.walletRepository
            .createQueryBuilder('wallets')
            .leftJoin('wallets.expenses', 'expense')
            .select('wallets.id', 'id')
            .addSelect('wallets.name', 'name')
            .addSelect('COALESCE(SUM(expense.value), 0)', 'total_expenses')
            .where('wallets.profile.id = :profileId', { profileId })
            .groupBy('wallets.id')
            .addGroupBy('wallets.name');
        const earningsQuery = this.walletRepository
            .createQueryBuilder('wallets')
            .leftJoin('wallets.earnings', 'earning')
            .select('wallets.id', 'id')
            .addSelect('COALESCE(SUM(earning.value), 0)', 'total_earnings')
            .where('wallets.profile.id = :profileId', { profileId })
            .groupBy('wallets.id');
        if (id) {
            expensesQuery.andWhere('wallets.id = :id', { id });
            earningsQuery.andWhere('wallets.id = :id', { id });
        }
        const [walletExpenses, walletEarnings] = await Promise.all([
            expensesQuery.getRawMany(),
            earningsQuery.getRawMany(),
        ]);
        const earningsMap = new Map();
        walletEarnings.forEach((earning) => {
            earningsMap.set(Number(earning.id), Number(earning.total_earnings));
        });
        return walletExpenses.map((walletExpense) => {
            const walletId = Number(walletExpense.id);
            const totalExpenses = Number(walletExpense.total_expenses);
            const totalEarnings = earningsMap.get(walletId) || 0;
            return {
                id: walletId,
                name: walletExpense.name,
                totalExpenses,
                totalEarnings,
                balance: totalEarnings - totalExpenses,
            };
        });
    }
    async createBaseWallets(profileId) {
        try {
            const baseWallets = [
                {
                    name: 'Efectivo',
                },
                {
                    name: 'Cuenta Bancaria',
                },
                {
                    name: 'Tarjeta Debito',
                },
                {
                    name: 'Tarjeta Credito',
                },
                {
                    name: 'Ahorros',
                },
                {
                    name: 'Inversiones',
                },
                {
                    name: 'Billeteras Digitales',
                },
                {
                    name: 'Otros',
                },
            ];
            await this.walletRepository.insert(baseWallets.map((wallet) => ({
                name: wallet.name,
                profile: { id: profileId },
            })));
            return {
                success: true,
                message: `${baseWallets.length} base wallets created successfully`,
            };
        }
        catch {
            throw new common_1.BadRequestException('The Base Wallets Couldnt Be Created');
        }
    }
    async update(id, changes, profileId) {
        try {
            const wallet = await this.findOne(id, profileId);
            const mergedWallet = this.walletRepository.merge(wallet, changes);
            const updatedWallet = await this.walletRepository.save(mergedWallet);
            return updatedWallet;
        }
        catch {
            throw new common_1.BadRequestException('The Wallet Could Not Be Updated');
        }
    }
    async remove(id, profileId) {
        const wallet = await this.findOne(id, profileId);
        await this.walletRepository.delete(wallet.id);
        return { id };
    }
};
exports.WalletsService = WalletsService;
exports.WalletsService = WalletsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wallets_entity_1.Wallet)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], WalletsService);
//# sourceMappingURL=wallets.service.js.map