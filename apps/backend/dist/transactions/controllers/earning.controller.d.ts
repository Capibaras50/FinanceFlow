import { EarningService } from '../services/earning.service';
import { CreateEarningDto } from '../dto/create-earning.dto';
import { UpdateEarningDto } from '../dto/update-earning.dto';
export declare class EarningController {
    private earningService;
    constructor(earningService: EarningService);
    findAll(profileId: number): Promise<import("../entities/earning.entity").Earning[]>;
    findOne(profileId: number, id: number): Promise<import("../entities/earning.entity").Earning>;
    create(profileId: number, newEarning: CreateEarningDto): Promise<import("../entities/earning.entity").Earning>;
    update(profileId: number, updateEarningDto: UpdateEarningDto, id: number): Promise<import("../entities/earning.entity").Earning>;
    remove(profileId: number, id: number): Promise<import("../entities/earning.entity").Earning>;
}
