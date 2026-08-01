import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDebtDto } from '../dto/create-debt.dto';
import { UpdateDebtDto } from '../dto/update-debt.dto';
import {
  DeepPartial,
  Repository,
  DataSource,
  EntityManager,
  Like,
} from 'typeorm';
import { Debt } from '../entities/debt.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ContactsService } from 'src/contacts/services/contacts.service';
import { EarningService } from 'src/transactions/services/earning.service';
import { ExpenseService } from 'src/transactions/services/expense.service';
import { DirectionEnum } from '../enums/debt-user-type.enum';
import { WalletsService } from 'src/wallets/services/wallets.service';
import { CategoriesService } from 'src/categories/services/categories.service';
import { CategoryType } from 'src/categories/enums/category-type.enum';
import { DebtStatus } from '../enums/debt-status.enum';
import { FilterDebtDto } from '../dto/filter-debt.dto';

@Injectable()
export class DebtsService {
  constructor(
    @InjectRepository(Debt)
    private debtRepository: Repository<Debt>,
    private contactsService: ContactsService,
    private earningsService: EarningService,
    private expensesService: ExpenseService,
    private walletsService: WalletsService,
    private categoriesService: CategoriesService,
    private dataSource: DataSource,
  ) {}

  async create(profileId: number, createDebtDto: CreateDebtDto) {
    try {
      const interestRate = (createDebtDto.interestRate || 0) / 100;
      const newDebt: DeepPartial<Debt> = {
        ...createDebtDto,
        interestRate,
        profile: { id: profileId },
      };
      if (createDebtDto.contactId) {
        const contact = await this.contactsService.findOne(
          profileId,
          createDebtDto.contactId,
        );
        newDebt.contact = { id: contact.id };
      }
      const createdDebt = this.debtRepository.create(newDebt);
      return await this.debtRepository.save(createdDebt);
    } catch {
      throw new BadRequestException('The Debt Couldnt Be Created');
    }
  }

  async findAll(profileId: number, filterDebtDto: FilterDebtDto) {
    const sortBy = filterDebtDto.sortBy || 'createdAt';
    const sortOrder = filterDebtDto.sortOrder || 'DESC';
    const take = filterDebtDto.limit || 10;
    const page = filterDebtDto.page || 1;
    const order = { [sortBy]: sortOrder };
    const where = [
      {
        profile: { id: profileId },
      },
      {
        contact: {
          addressee: { id: profileId },
        },
      },
    ];
    if (filterDebtDto.status) {
      where[0]['status'] = filterDebtDto.status;
      where[1]['status'] = filterDebtDto.status;
    }
    if (filterDebtDto.priority) {
      where[0]['priority'] = filterDebtDto.priority;
      where[1]['priority'] = filterDebtDto.priority;
    }
    if (filterDebtDto.name) {
      where[0]['name'] = Like(`%${filterDebtDto.name}%`);
      where[1]['name'] = Like(`%${filterDebtDto.name}%`);
    }
    if (filterDebtDto.direction) {
      where[0]['direction'] = filterDebtDto.direction;
      where[1]['direction'] =
        filterDebtDto.direction === DirectionEnum.RECEIVABLE
          ? DirectionEnum.PAYABLE
          : DirectionEnum.RECEIVABLE;
    }
    if (filterDebtDto.contactName) {
      where[0]['contactName'] = Like(`%${filterDebtDto.contactName}%`);
      where[1]['contactName'] = Like(`%${filterDebtDto.contactName}%`);
    }
    const debts = await this.debtRepository.find({
      where,
      take,
      skip: (page - 1) * take,
      relations: ['contact', 'contact.requester', 'contact.addressee'],
      order,
    });
    return debts;
  }

  async searchOne(profileId: number, id: number) {
    const debt = await this.debtRepository.findOne({
      where: [
        {
          profile: { id: profileId },
          id,
        },
        {
          id,
          contact: {
            addressee: { id: profileId },
          },
        },
      ],
      relations: ['contact', 'contact.requester', 'contact.addressee'],
    });
    if (!debt) {
      throw new NotFoundException('The Debt Not Found');
    }
    return debt;
  }

  async findOne(profileId: number, id: number) {
    const debt = await this.debtRepository.findOne({
      where: {
        profile: { id: profileId },
        id,
      },
      relations: ['contact', 'contact.requester', 'contact.addressee'],
    });
    if (!debt) {
      throw new NotFoundException('The Debt Not Found');
    }
    return debt;
  }

  async update(profileId: number, id: number, updateDebtDto: UpdateDebtDto) {
    try {
      const debt = await this.findOne(profileId, id);
      const changes: DeepPartial<Debt> = {
        ...updateDebtDto,
      };
      if (updateDebtDto.interestRate) {
        changes.interestRate = updateDebtDto.interestRate / 100;
      }
      if (updateDebtDto.contactId) {
        const contact = await this.contactsService.findOne(
          profileId,
          updateDebtDto.contactId,
        );
        changes.contact = { id: contact.id };
      }
      const mergedDebt = this.debtRepository.merge(debt, changes);
      return await this.debtRepository.save(mergedDebt);
    } catch {
      throw new BadRequestException('The Debt Couldnt Be Updated');
    }
  }

  async remove(profileId: number, id: number) {
    const debt = await this.findOne(profileId, id);
    return await this.debtRepository.delete({
      id: debt.id,
    });
  }

  async payDebt(profileId: number, id: number, receiptUrl?: string) {
    return await this.dataSource
      .transaction(async (manager) => {
        const now = new Date();
        const debt = await this.searchOne(profileId, id);
        if (
          debt.status === DebtStatus.PAID ||
          debt.status === DebtStatus.CANCELLED
        ) {
          throw new BadRequestException('The Debt already paid');
        }
        const addresseeId =
          debt.contact?.addressee.id === profileId
            ? debt.contact?.requester.id
            : debt.contact?.addressee.id;
        if (debt.direction !== DirectionEnum.RECEIVABLE) {
          await this.registerExpense(debt, profileId, manager);
          if (addresseeId) {
            await this.registerEarning(debt, addresseeId, manager);
          }
        } else {
          await this.registerEarning(debt, profileId, manager);
          if (addresseeId) {
            await this.registerExpense(debt, addresseeId, manager);
          }
        }
        const changes: DeepPartial<Debt> = {
          paidAt: now,
          receiptUrl: receiptUrl ? receiptUrl : undefined,
          status: DebtStatus.PAID,
        };
        const mergedDebt = this.debtRepository.merge(debt, changes);
        return await manager.getRepository(Debt).save(mergedDebt);
      })
      .catch(() => {
        throw new BadRequestException(
          'The Debt Couldnt Be Payd In This Moment, Retry Again Later',
        );
      });
  }

  private async registerExpense(
    debt: Debt,
    profileId: number,
    manager?: EntityManager,
  ) {
    const wallet = await this.walletsService.findByName('Efectivo', profileId);
    if (!wallet) {
      throw new BadRequestException('No wallet found for this profile');
    }
    const categories = await this.categoriesService.findByName(
      'Otros',
      profileId,
      CategoryType.EXPENSE,
    );
    if (categories.length === 0) {
      throw new BadRequestException(
        'Default expense category not found for this profile',
      );
    }
    await this.expensesService.create(
      {
        name: `Deuda ${debt.name}`,
        value: debt.amount,
        walletId: wallet,
        categoryId: categories[0],
      },
      profileId,
      manager,
    );
  }

  private async registerEarning(
    debt: Debt,
    profileId: number,
    manager?: EntityManager,
  ) {
    const wallet = await this.walletsService.findByName('Efectivo', profileId);
    if (!wallet) {
      throw new BadRequestException('No wallet found for this profile');
    }
    const categories = await this.categoriesService.findByName(
      'Otros Ingresos',
      profileId,
      CategoryType.EARNING,
    );
    if (categories.length === 0) {
      throw new BadRequestException(
        'Default earning category not found for this profile',
      );
    }
    await this.earningsService.create(
      {
        name: `Deuda ${debt.name}`,
        value: debt.amount,
        walletId: wallet,
        categoryId: categories[0],
      },
      profileId,
      manager,
    );
  }

  async getSummary(profileId: number) {
    const result = await this.debtRepository
      .createQueryBuilder('debts')
      .leftJoin('debts.contact', 'contact')
      .select([
        `COALESCE(SUM(CASE
          WHEN (debts.profile_id = :profileId AND debts.direction = 'payable')
            OR (contact.addressee_id = :profileId AND debts.direction = 'receivable')
          THEN debts.amount ELSE 0 END), 0) AS "payableTotal"`,
        `COALESCE(SUM(CASE
          WHEN (debts.profile_id = :profileId AND debts.direction = 'receivable')
            OR (contact.addressee_id = :profileId AND debts.direction = 'payable')
          THEN debts.amount ELSE 0 END), 0) AS "receivableTotal"`,
      ])
      .where('debts.profile_id = :profileId OR contact.addressee_id = :profileId', {
        profileId,
      })
      .andWhere('debts.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: [DebtStatus.PAID, DebtStatus.CANCELLED],
      })
      .getRawOne<{
        payableTotal: string;
        receivableTotal: string;
      }>();

    return {
      payableTotal: Number(result?.payableTotal ?? 0),
      receivableTotal: Number(result?.receivableTotal ?? 0),
    };
  }
}
