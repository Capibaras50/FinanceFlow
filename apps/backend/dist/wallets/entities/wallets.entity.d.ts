import { Earning } from "../../transactions/entities/earning.entity";
import { Expense } from "../../transactions/entities/expense.entity";
import { Profile } from "../../users/entities/profile.entity";
export declare class Wallet {
    id: number;
    name: string;
    profile: Profile;
    earnings: Earning[];
    expenses: Expense[];
    createdAt: Date;
    updatedAt: Date;
}
