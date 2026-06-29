import { Repository, DataSource } from 'typeorm';
import { Expense } from '../entities/expense.entity';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { WalletsService } from "../../wallets/services/wallets.service";
import { CategoriesService } from "../../categories/services/categories.service";
import { ReceiptService } from './receipt.service';
import { TopCategoriesInterface } from '../interfaces/top-categories.interface';
import { TotalExpensesInterface } from '../interfaces/monthly-summary.interface';
export declare class ExpenseService {
    private expensesRepository;
    private walletsService;
    private categoriesService;
    private receiptsService;
    private dataSource;
    constructor(expensesRepository: Repository<Expense>, walletsService: WalletsService, categoriesService: CategoriesService, receiptsService: ReceiptService, dataSource: DataSource);
    create(createExpenseDto: CreateExpenseDto, profileId: number): Promise<Expense>;
    findAll(profileId: number): Promise<Expense[]>;
    findOne(id: number, profileId: number): Promise<Expense>;
    findExpensesByCategory(categoriesIds: number[], profileId: number): Promise<{
        expenses: Expense[];
        totalExpenses: number;
        addition: number | null;
    }>;
    findExpensesByDateRange(startDate: Date, endDate: Date, profileId: number): Promise<Expense[]>;
    getTopCategories(profileId: number, take: number): Promise<TopCategoriesInterface[]>;
    getTotalExpenses(profileId: number, month: number): Promise<TotalExpensesInterface | undefined>;
    update(id: number, profileId: number, updateExpenseDto: UpdateExpenseDto): Promise<Expense>;
    createExpenseFromReceipt(nameExpense: string, descriptionExpense: string, valueExpense: number, walletName: string, categoryName: string, profileId: number, fileName: string, sizeBytes: number, mimeType: string, receiptUrl: string, extractionConfidence: number, jobId: string | undefined, attempts: number, lastError: string | undefined): Promise<Expense>;
    remove(id: number, profileId: number): Promise<number>;
}
