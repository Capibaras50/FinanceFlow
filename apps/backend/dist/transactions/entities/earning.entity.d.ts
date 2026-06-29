import { Category } from "../../categories/entities/category.entity";
import { Profile } from "../../users/entities/profile.entity";
import { Wallet } from "../../wallets/entities/wallets.entity";
export declare class Earning {
    id: number;
    name: string;
    description: string;
    value: number;
    wallet: Wallet;
    categories: Category[];
    profile: Profile;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
