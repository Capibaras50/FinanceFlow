import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Earning } from '../entities/earning.entity';
import { CreateEarningDto } from '../dto/create-earning.dto';
import { UpdateEarningDto } from '../dto/update-earning.dto';
import { WalletsService } from 'src/wallets/services/wallets.service';
import { CategoriesService } from 'src/categories/services/categories.service';
import { TotalEarningsInterface } from '../interfaces/monthly-summary.interface';
import { FilterTransactionDto } from '../dto/filter-transaction.dto';

@Injectable()
export class EarningService {
  constructor(
    @InjectRepository(Earning)
    private earningRepository: Repository<Earning>,
    private walletsService: WalletsService,
    private categoriesService: CategoriesService,
  ) {}

  async findAll(profileId: number, filterTransactionDto: FilterTransactionDto) {
    try {
      const order = filterTransactionDto.sortBy
        ? { [filterTransactionDto.sortBy]: filterTransactionDto.sortOrder }
        : undefined;
      const where = {
        profile: { id: profileId },
        deletedAt: undefined,
      };
      if (filterTransactionDto.category) {
        where['categories'] = { name: filterTransactionDto.category };
      }
      if (filterTransactionDto.wallet) {
        where['wallet'] = { name: filterTransactionDto.wallet };
      }
      const earnings = await this.earningRepository.find({
        where,
        relations: ['categories', 'wallet'],
        take: filterTransactionDto.limit || 10,
        skip: ((filterTransactionDto.page ?? 1) - 1) * 10,
        order: order ? order : { createdAt: 'DESC' },
      });

      return earnings;
    } catch {
      throw new BadRequestException('Couldnt Get Anyone Earning');
    }
  }

  async findOne(id: number, profileId: number) {
    const earning = await this.earningRepository.findOne({
      where: {
        id,
        profile: { id: profileId },
        deletedAt: undefined,
      },
      relations: ['categories', 'wallet'],
    });
    if (!earning) {
      throw new NotFoundException('The earning Not Found');
    }
    return earning;
  }

  async getTotalEarnings(profileId: number, month: number) {
    const totalEarnings = await this.earningRepository
      .createQueryBuilder('earnings')
      .select('COALESCE(SUM(earnings.value), 0)', 'totalEarnings')
      .addSelect('COUNT(earnings.id)', 'numEarnings')
      .where('earnings.profile.id = :profileId', { profileId, month })
      .andWhere('EXTRACT(MONTH FROM earnings.createdAt) = :month', { month })
      .andWhere('earnings.deletedAt IS NULL')
      .getRawOne<TotalEarningsInterface>();
    return totalEarnings;
  }

  async create(newEarning: CreateEarningDto, profileId: number) {
    try {
      const earning: DeepPartial<Earning> = {
        ...newEarning,
        wallet: { id: newEarning.walletId },
        categories: newEarning.categoriesId.map((id) => ({ id })),
        profile: { id: profileId },
      };
      const createdEarning = this.earningRepository.create(earning);
      return await this.earningRepository.save(createdEarning);
    } catch {
      throw new BadRequestException('The Earning Couldnt Be Created');
    }
  }

  async update(
    id: number,
    updateEarningDto: UpdateEarningDto,
    profileId: number,
  ) {
    try {
      const changes: DeepPartial<Earning> = {};
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
        const wallet = await this.walletsService.findOne(
          updateEarningDto.walletId,
          profileId,
        );
        changes.wallet = { id: wallet.id };
      }

      const mergedEarning = this.earningRepository.merge(earning, changes);
      if (updateEarningDto.categoriesId !== undefined) {
        const categories = await this.categoriesService.findByIds(
          updateEarningDto.categoriesId,
          profileId,
        );
        mergedEarning.categories = categories;
      }
      return await this.earningRepository.save(mergedEarning);
    } catch {
      throw new BadRequestException('The Earning Couldnt Be Updated');
    }
  }

  async remove(id: number, profileId: number) {
    try {
      const earning = await this.findOne(id, profileId);
      const mergedEarning = this.earningRepository.merge(earning, {
        deletedAt: new Date(),
      });
      return await this.earningRepository.save(mergedEarning);
    } catch {
      throw new BadRequestException('The Earning Couldnt Be Removed');
    }
  }
}
