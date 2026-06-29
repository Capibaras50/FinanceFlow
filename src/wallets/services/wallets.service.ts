import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWalletDto } from '../dto/create-wallets.dto';
import { UpdateWalletDto } from '../dto/update-wallets.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from '../entities/wallets.entity';
import { Repository } from 'typeorm';
import {
  WalletEarningsInterface,
  WalletExpensesInterface,
} from '../interfaces/wallet-balance.interface';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}
  async create(CreateWalletDto: CreateWalletDto, profileId: number) {
    try {
      const newWallet = {
        ...CreateWalletDto,
        profile: { id: profileId },
      };
      const createdWallet = this.walletRepository.create(newWallet);
      const savedWallet = await this.walletRepository.save(createdWallet);
      return savedWallet;
    } catch {
      throw new BadRequestException('The Wallet Could not be created');
    }
  }

  async findAll(profileId: number) {
    const wallets = await this.walletRepository.find({
      where: { profile: { id: profileId } },
    });
    return wallets;
  }

  async findOne(id: number, profileId: number) {
    const wallet = await this.walletRepository.findOne({
      where: {
        profile: { id: profileId },
        id,
      },
    });
    if (!wallet) {
      throw new NotFoundException('The Wallet Not Found');
    }
    return wallet;
  }

  async findByName(name: string, profileId: number) {
    const wallets = await this.findAll(profileId);
    const filteredWallets = wallets.filter((wallet) =>
      wallet.name.toLowerCase().includes(name.toLowerCase()),
    );
    return filteredWallets[0]?.id ?? wallets[0]?.id;
  }

  async getWalletBalance(profileId: number, id?: number) {
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
      expensesQuery.getRawMany<WalletExpensesInterface>(),
      earningsQuery.getRawMany<WalletEarningsInterface>(),
    ]);

    const earningsMap = new Map<number, number>();
    walletEarnings.forEach((earning) => {
      earningsMap.set(Number(earning.id), Number(earning.total_earnings));
    });

    return walletExpenses.map((walletExpense) => {
      const walletId = Number(walletExpense.id);
      const totalExpenses = Number(walletExpense.total_expenses);
      const totalEarnings = earningsMap.get(walletId) || 0; // Si no hay ingresos, es 0

      return {
        id: walletId,
        name: walletExpense.name,
        totalExpenses,
        totalEarnings,
        balance: totalEarnings - totalExpenses,
      };
    });
  }

  async createBaseWallets(profileId: number) {
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
      await this.walletRepository.insert(
        baseWallets.map((wallet) => ({
          name: wallet.name,
          profile: { id: profileId },
        })),
      );
      return {
        success: true,
        message: `${baseWallets.length} base wallets created successfully`,
      };
    } catch {
      throw new BadRequestException('The Base Wallets Couldnt Be Created');
    }
  }

  async update(id: number, changes: UpdateWalletDto, profileId: number) {
    try {
      const wallet = await this.findOne(id, profileId);
      const mergedWallet = this.walletRepository.merge(wallet, changes);
      const updatedWallet = await this.walletRepository.save(mergedWallet);
      return updatedWallet;
    } catch {
      throw new BadRequestException('The Wallet Could Not Be Updated');
    }
  }

  async remove(id: number, profileId: number) {
    const wallet = await this.findOne(id, profileId);
    await this.walletRepository.delete(wallet.id);
    return { id };
  }
}
