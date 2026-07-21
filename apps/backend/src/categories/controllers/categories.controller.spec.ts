import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { CategoriesService } from '../services/categories.service';
import { CategoriesController } from './categories.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from '../entities/category.entity';
import { Repository } from 'typeorm';
import { Profile } from 'src/users/entities/profile.entity';
import { CategoryType } from '../enums/category-type.enum';

const makeCategory = (overrides?: Partial<Category>): Category => {
  return {
    id: 1,
    name: 'Default',
    description: 'Description',
    color: '#7C3AED',
    profile: { id: 1 } as Profile,
    earnings: [],
    expenses: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    type: CategoryType.EXPENSE,
    ...overrides,
  };
};

describe('CategoriesController', () => {
  const NOW = new Date();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let service: CategoriesService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let repository: Repository<Category>;
  let controller: CategoriesController;

  beforeEach(async () => {
    const mockCategoriesService = {
      findAll: jest
        .fn<
          (
            profileId: number,
            take?: number,
            page?: number,
          ) => Promise<Category[]>
        >()
        .mockResolvedValue([
          makeCategory({
            name: 'Restaurantes',
            createdAt: NOW,
            updatedAt: NOW,
          }),
        ]),
      create: jest.fn(),
      findOne: jest.fn(),
      findByIds: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: {
            find: jest.fn<() => Promise<Category[]>>().mockResolvedValue([
              makeCategory({
                name: 'Restaurantes',
                createdAt: NOW,
                updatedAt: NOW,
              }),
            ]),
          },
        },
      ],
      controllers: [CategoriesController],
    }).compile();

    service = module.get(CategoriesService);
    repository = module.get(getRepositoryToken(Category));
    controller = module.get(CategoriesController);
  });

  it('should return categories', async () => {
    const result = await controller.findAll(1, { limit: 10, page: 1 });
    expect(result).toEqual([
      {
        id: 1,
        name: 'Restaurantes',
        color: '#7C3AED',
        description: 'Description',
        profile: { id: 1 },
        earnings: [],
        expenses: [],
        createdAt: NOW,
        updatedAt: NOW,
      },
    ]);
  });
});
