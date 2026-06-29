import { Repository } from 'typeorm';
import { Earning } from '../entities/earning.entity';
import { CreateEarningDto } from '../dto/create-earning.dto';
import { UpdateEarningDto } from '../dto/update-earning.dto';
import { WalletsService } from "../../wallets/services/wallets.service";
import { CategoriesService } from "../../categories/services/categories.service";
import { TotalEarningsInterface } from '../interfaces/monthly-summary.interface';
export declare class EarningService {
    private earningRepository;
    private walletsService;
    private categoriesService;
    constructor(earningRepository: Repository<Earning>, walletsService: WalletsService, categoriesService: CategoriesService);
    findAll(profileId: number): Promise<Earning[]>;
    findOne(id: number, profileId: number): Promise<Earning>;
    getTotalEarnings(profileId: number, month: number): Promise<TotalEarningsInterface | undefined>;
    create(newEarning: CreateEarningDto, profileId: number): Promise<Earning>;
    update(id: number, updateEarningDto: UpdateEarningDto, profileId: number): Promise<Earning>;
    remove(id: number, profileId: number): Promise<Earning>;
}
