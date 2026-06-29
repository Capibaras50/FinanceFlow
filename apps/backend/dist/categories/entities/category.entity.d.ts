import { Earning } from "../../transactions/entities/earning.entity";
import { Expense } from "../../transactions/entities/expense.entity";
import { Profile } from "../../users/entities/profile.entity";
export declare class Category {
    id: number;
    name: string;
    description: string;
    color: string;
    profile: Profile;
    earnings: Earning[];
    expenses: Expense[];
    createdAt: Date;
    updatedAt: Date;
}
