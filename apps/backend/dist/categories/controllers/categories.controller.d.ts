import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createCategoryDto: CreateCategoryDto, profileId: number): Promise<import("../entities/category.entity").Category>;
    findAll(profileId: number): Promise<import("../entities/category.entity").Category[]>;
    findOne(id: number, profileId: number): Promise<import("../entities/category.entity").Category>;
    update(id: number, updateCategoryDto: UpdateCategoryDto, profileId: number): Promise<import("../entities/category.entity").Category>;
    remove(id: number, profileId: number): Promise<number>;
}
