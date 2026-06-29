import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Category } from '../entities/category.entity';
import { Repository } from 'typeorm';
export declare class CategoriesService {
    private categoriesRepository;
    constructor(categoriesRepository: Repository<Category>);
    create(createCategoryDto: CreateCategoryDto, profileId: number): Promise<Category>;
    findAll(profileId: number): Promise<Category[]>;
    findByIds(categoriesId: number[], profileId: number): Promise<Category[]>;
    findOne(id: number, profileId: number): Promise<Category>;
    findByName(name: string, profileId: number): Promise<number[]>;
    createBaseCateogories(profileId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    update(id: number, updateCategoryDto: UpdateCategoryDto, profileId: number): Promise<Category>;
    remove(id: number, profileId: number): Promise<number>;
}
