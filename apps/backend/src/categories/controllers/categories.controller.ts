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
import { FilterCategoryDto } from '../dto/filter-category.dto';
import { BreakdownCategoryDto } from '../dto/breakdown-category.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Category } from '../entities/category.entity';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiBody({ type: CreateCategoryDto })
  @ApiCreatedResponse({
    description: 'Create one category',
    type: Category,
  })
  @ApiBadRequestResponse({
    description: 'The Category could not be created',
  })
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @GetUser('profileId') profileId: number,
  ) {
    return this.categoriesService.create(createCategoryDto, profileId);
  }

  @Get()
  @ApiOkResponse({
    description: 'Return all categories of user',
  })
  findAll(
    @GetUser('profileId') profileId: number,
    @Query() filterCategoryDto: FilterCategoryDto,
  ) {
    return this.categoriesService.findAll(
      profileId,
      filterCategoryDto.limit,
      filterCategoryDto.page,
      filterCategoryDto.type,
    );
  }

  @Get('breakdown')
  @ApiOkResponse({
    description: 'Return a summary with the different categories',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          categoryId: {
            type: 'number',
            example: 1,
          },
          name: {
            type: 'string',
            example: 'Category Name',
          },
          color: {
            type: 'string',
          },
          value: {
            type: 'number',
            example: 1000,
          },
          count: {
            type: 'number',
            example: 1,
          },
          type: {
            type: 'string',
            enum: ['expense', 'earning'],
          },
        },
      },
    },
  })
  breakdown(
    @GetUser('profileId') profileId: number,
    @Query() breakdownCategoryDto: BreakdownCategoryDto,
  ) {
    return this.categoriesService.getBreakdown(profileId, breakdownCategoryDto);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({
    description: 'Return one category of user',
    type: Category,
  })
  @ApiNotFoundResponse({
    description: 'The category not exists',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('profileId') profileId: number,
  ) {
    return this.categoriesService.findOne(id, profileId);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiOkResponse({
    description: 'Update one category of user',
    type: Category,
  })
  @ApiBadRequestResponse({
    description: 'The Category Could Not Be Updated',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @GetUser('profileId') profileId: number,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, profileId);
  }

  @HttpCode(204)
  @Delete(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse({
    description: 'Delete one category of user',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('profileId') profileId: number,
  ) {
    return this.categoriesService.remove(id, profileId);
  }
}
