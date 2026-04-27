import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto, profileId: number) {
    try {
      const category = {
        ...createCategoryDto,
        profile: { id: profileId },
      };
      const createdCategory = this.categoriesRepository.create(category);
      const newCategory = await this.categoriesRepository.save(createdCategory);
      return newCategory;
    } catch {
      throw new BadRequestException('The Category could not be created');
    }
  }

  async findAll(profileId: number) {
    const categories = this.categoriesRepository.find({
      where: { profile: { id: profileId } },
    });
    return categories;
  }

  async findOne(id: number, profileId: number) {
    const category = await this.categoriesRepository.findOne({
      where: {
        profile: { id: profileId },
        id,
      },
    });
    if (!category) {
      throw new NotFoundException('The Category Not found');
    }
    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    profileId: number,
  ) {
    try {
      const category = await this.findOne(id, profileId);
      const mergedCategory = this.categoriesRepository.merge(
        category,
        updateCategoryDto,
      );
      const savedCategory =
        await this.categoriesRepository.save(mergedCategory);
      return savedCategory;
    } catch {
      throw new BadRequestException('The Category Could Not Be Updated');
    }
  }

  async remove(id: number, profileId: number) {
    const category = await this.findOne(id, profileId);
    const mergedCategory = this.categoriesRepository.merge(category, {
      deletedAt: new Date(),
    });
    const savedCategory = await this.categoriesRepository.save(mergedCategory);
    return savedCategory.id;
  }
}
