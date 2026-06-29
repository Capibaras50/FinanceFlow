import { Category } from "../../categories/entities/category.entity";
import { Profile } from "../../users/entities/profile.entity";
import { Wallet } from "../../wallets/entities/wallets.entity";
import { Receipt } from './receipt.entity';
export declare class Expense {
    id: number;
    name: string;
    description: string;
    value: number;
    wallet: Wallet;
    categories: Category[];
    profile: Profile;
    receipt: Receipt;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
