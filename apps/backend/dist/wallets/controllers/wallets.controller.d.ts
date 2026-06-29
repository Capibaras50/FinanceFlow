import { WalletsService } from '../services/wallets.service';
import { CreateWalletDto } from '../dto/create-wallets.dto';
import { UpdateWalletDto } from '../dto/update-wallets.dto';
export declare class WalletsController {
    private readonly walletsService;
    constructor(walletsService: WalletsService);
    create(createWalletDto: CreateWalletDto, profileId: number): Promise<import("../entities/wallets.entity").Wallet>;
    findAll(profileId: number): Promise<import("../entities/wallets.entity").Wallet[]>;
    getBalance(profileId: number): Promise<{
        id: number;
        name: string;
        totalExpenses: number;
        totalEarnings: number;
        balance: number;
    }[]>;
    getBalanceById(id: number, profileId: number): Promise<{
        id: number;
        name: string;
        totalExpenses: number;
        totalEarnings: number;
        balance: number;
    }[]>;
    findOne(id: number, profileId: number): Promise<import("../entities/wallets.entity").Wallet>;
    update(id: number, updateWalletDto: UpdateWalletDto, profileId: number): Promise<import("../entities/wallets.entity").Wallet>;
    remove(id: number, profileId: number): Promise<{
        id: number;
    }>;
}
