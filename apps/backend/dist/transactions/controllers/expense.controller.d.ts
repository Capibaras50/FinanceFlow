import { ExpenseService } from '../services/expense.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
export declare class ExpenseController {
    private expenseService;
    constructor(expenseService: ExpenseService);
    findOne(profileId: number, id: number): Promise<import("../entities/expense.entity").Expense>;
    findAll(profileId: number): Promise<import("../entities/expense.entity").Expense[]>;
    create(profileId: number, newExpense: CreateExpenseDto): Promise<import("../entities/expense.entity").Expense>;
    update(profileId: number, changes: UpdateExpenseDto, id: number): Promise<import("../entities/expense.entity").Expense>;
    remove(profileId: number, id: number): Promise<number>;
}
