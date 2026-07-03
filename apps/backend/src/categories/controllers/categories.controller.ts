import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  Query,
} from '@nestjs/common';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../decorators/get-user.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @GetUser('profileId') profileId: number,
  ) {
    return this.categoriesService.create(createCategoryDto, profileId);
  }

  @Get()
  findAll(
    @GetUser('profileId') profileId: number,
    @Query() pagination: PaginationDto,
  ) {
    return this.categoriesService.findAll(
      profileId,
      pagination.limit,
      pagination.page,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('profileId') profileId: number,
  ) {
    return this.categoriesService.findOne(id, profileId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @GetUser('profileId') profileId: number,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, profileId);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('profileId') profileId: number,
  ) {
    return this.categoriesService.remove(id, profileId);
  }
}
