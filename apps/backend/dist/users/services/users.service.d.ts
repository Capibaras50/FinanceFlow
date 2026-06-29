import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CategoriesService } from "../../categories/services/categories.service";
import { WalletsService } from "../../wallets/services/wallets.service";
export declare class UsersService {
    private usersRepository;
    private categoriesService;
    private walletsService;
    constructor(usersRepository: Repository<User>, categoriesService: CategoriesService, walletsService: WalletsService);
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<User>;
    findProfileById(id: number): Promise<import("../entities/profile.entity").Profile>;
    findUserByEmail(email: string): Promise<User | null>;
    create(createUserDto: CreateUserDto): Promise<User>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: number): Promise<{
        id: number;
    }>;
}
