import { User } from './user.entity';
import { Category } from "../../categories/entities/category.entity";
import { Expense } from "../../transactions/entities/expense.entity";
import { Earning } from "../../transactions/entities/earning.entity";
import { Wallet } from "../../wallets/entities/wallets.entity";
import { Receipt } from "../../transactions/entities/receipt.entity";
export declare class Profile {
    id: number;
    name: string;
    avatarUrl: string;
    user: User;
    categories: Category[];
    expenses: Expense[];
    earnings: Earning[];
    receipts: Receipt[];
    wallets: Wallet[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
