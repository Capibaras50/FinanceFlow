import { CreateWalletDto } from '../dto/create-wallets.dto';
import { UpdateWalletDto } from '../dto/update-wallets.dto';
import { Wallet } from '../entities/wallets.entity';
import { Repository } from 'typeorm';
export declare class WalletsService {
    private walletRepository;
    constructor(walletRepository: Repository<Wallet>);
    create(CreateWalletDto: CreateWalletDto, profileId: number): Promise<Wallet>;
    findAll(profileId: number): Promise<Wallet[]>;
    findOne(id: number, profileId: number): Promise<Wallet>;
    findByName(name: string, profileId: number): Promise<number>;
    getWalletBalance(profileId: number, id?: number): Promise<{
        id: number;
        name: string;
        totalExpenses: number;
        totalEarnings: number;
        balance: number;
    }[]>;
    createBaseWallets(profileId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    update(id: number, changes: UpdateWalletDto, profileId: number): Promise<Wallet>;
    remove(id: number, profileId: number): Promise<{
        id: number;
    }>;
}
