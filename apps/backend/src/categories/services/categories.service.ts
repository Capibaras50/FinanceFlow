import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../entities/category.entity';
import { Repository, In, FindOptionsWhere, DataSource } from 'typeorm';
import { CategoryType } from '../enums/category-type.enum';
import { Expense } from 'src/transactions/entities/expense.entity';
import { Earning } from 'src/transactions/entities/earning.entity';
import { BreakdownCategoryDto } from '../dto/breakdown-category.dto';

export interface CategoryBreakdownRow {
  categoryId: number;
  name: string;
  color: string;
  value: number;
  count: number;
  type: CategoryType;
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    private dataSource: DataSource,
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

  async findAll(
    profileId: number,
    take?: number,
    page?: number,
    type?: CategoryType,
  ) {
    const where = {
      profile: { id: profileId },
    };
    if (type) {
      where['type'] = type;
    }
    const categories = await this.categoriesRepository.find({
      where,
      take: take || 10,
      skip: ((page ?? 1) - 1) * 10,
    });
    return categories;
  }

  async getBreakdown(profileId: number, dto: BreakdownCategoryDto) {
    const from = dto.from ? new Date(dto.from) : undefined;
    const to = dto.to ? new Date(dto.to) : undefined;

    const runQuery = async (type: CategoryType) => {
      const entity = type === CategoryType.EXPENSE ? Expense : Earning;
      const alias = type === CategoryType.EXPENSE ? 'expense' : 'earning';
      const qb = this.dataSource
        .createQueryBuilder(entity, alias)
        .innerJoin(`${alias}.category`, 'category')
        .select('category.id', 'categoryId')
        .addSelect('category.name', 'name')
        .addSelect('category.color', 'color')
        .addSelect(`SUM(${alias}.value)`, 'value')
        .addSelect(`COUNT(${alias}.id)`, 'count')
        .where(`${alias}.profile_id = :profileId`, { profileId })
        .andWhere(`${alias}.deleted_at IS NULL`)
        .groupBy('category.id')
        .addGroupBy('category.name')
        .addGroupBy('category.color');

      if (from) {
        qb.andWhere(`${alias}.created_at >= :from`, { from });
      }
      if (to) {
        qb.andWhere(`${alias}.created_at <= :to`, { to });
      }

      const rows = await qb.getRawMany<{
        categoryId: string;
        name: string;
        color: string;
        value: string;
        count: string;
      }>();

      return rows.map((row) => ({
        categoryId: Number(row.categoryId),
        name: row.name,
        color: row.color,
        value: Number(row.value),
        count: Number(row.count),
        type,
      }));
    };

    const types =
      dto.type === undefined
        ? [CategoryType.EXPENSE, CategoryType.EARNING]
        : [dto.type];

    const results = await Promise.all(types.map((t) => runQuery(t)));
    const breakdown = results.flat().sort((a, b) => b.value - a.value);
    return breakdown as CategoryBreakdownRow[];
  }

  async findByIds(categoriesId: number[], profileId: number) {
    const categories = await this.categoriesRepository.find({
      where: {
        id: In(categoriesId),
        profile: { id: profileId },
      },
    });
    if (categories.length !== categoriesId.length) {
      throw new NotFoundException('Some categories were not found');
    }
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

  async findByName(name: string, profileId: number, type?: CategoryType) {
    const where: FindOptionsWhere<Category> = { profile: { id: profileId } };
    if (type) {
      where.type = type;
    }
    const categories = await this.categoriesRepository.find({ where });
    const filteredCategories = categories.filter(
      (category) => category.name.toLowerCase() === name.toLowerCase(),
    );
    if (filteredCategories.length > 0) {
      return filteredCategories.map((category) => category.id);
    }
    if (!type && categories.length > 0) {
      return [categories[0].id];
    }
    throw new NotFoundException('No categories found for this profile');
  }

  async createBaseCateogories(profileId: number) {
    try {
      const baseCategories = [
        {
          name: 'Vivienda',
          profile: { id: profileId },
          color: '#FF5733',
          type: CategoryType.EXPENSE,
          description: 'Alquiler, hipoteca, servicios públicos e internet.',
        },
        {
          name: 'Alimentación',
          profile: { id: profileId },
          color: '#2ECC71',
          type: CategoryType.EXPENSE,
          description: 'Compras de supermercado y víveres para el hogar.',
        },
        {
          name: 'Transporte',
          profile: { id: profileId },
          color: '#3498DB',
          type: CategoryType.EXPENSE,
          description:
            'Transporte público, combustible y mantenimiento de vehículos.',
        },
        {
          name: 'Salud',
          profile: { id: profileId },
          color: '#E74C3C',
          type: CategoryType.EXPENSE,
          description: 'Gastos médicos, farmacia y seguros.',
        },
        {
          name: 'Restaurantes',
          profile: { id: profileId },
          color: '#F1C40F',
          type: CategoryType.EXPENSE,
          description: 'Comida fuera de casa, cafés y domicilios.',
        },
        {
          name: 'Suscripciones',
          profile: { id: profileId },
          color: '#9B59B6',
          type: CategoryType.EXPENSE,
          description:
            'Plataformas de streaming, software y servicios digitales.',
        },
        {
          name: 'Ocio y Cultura',
          profile: { id: profileId },
          color: '#E67E22',
          type: CategoryType.EXPENSE,
          description:
            'Cine, libros, videojuegos y entretenimiento en general.',
        },
        {
          name: 'Compras',
          profile: { id: profileId },
          color: '#1ABC9C',
          type: CategoryType.EXPENSE,
          description: 'Ropa, calzado y artículos personales o para el hogar.',
        },
        {
          name: 'Educación',
          profile: { id: profileId },
          color: '#34495E',
          type: CategoryType.EXPENSE,
          description: 'Cursos, materiales de estudio y formación profesional.',
        },
        {
          name: 'Ahorro e Inversión',
          profile: { id: profileId },
          color: '#27AE60',
          type: CategoryType.EXPENSE,
          description:
            'Fondos de emergencia, inversiones y ahorro a largo plazo.',
        },
        {
          name: 'Deudas',
          profile: { id: profileId },
          color: '#C0392B',
          type: CategoryType.EXPENSE,
          description: 'Pago de tarjetas de crédito y préstamos pendientes.',
        },
        {
          name: 'Otros',
          profile: { id: profileId },
          color: '#95A5A6',
          type: CategoryType.EXPENSE,
          description: 'Gastos varios que no entran en categorías específicas.',
        },
        {
          name: 'Salario',
          profile: { id: profileId },
          color: '#2ECC71',
          type: CategoryType.EARNING,
          description: 'Ingreso fijo por empleo o contrato laboral.',
        },
        {
          name: 'Freelance',
          profile: { id: profileId },
          color: '#3498DB',
          type: CategoryType.EARNING,
          description: 'Ingresos por trabajos independientes o por proyecto.',
        },
        {
          name: 'Inversiones',
          profile: { id: profileId },
          color: '#8E44AD',
          type: CategoryType.EARNING,
          description:
            'Rendimientos de acciones, fondos, dividendos y otros instrumentos.',
        },
        {
          name: 'Alquileres',
          profile: { id: profileId },
          color: '#E67E22',
          type: CategoryType.EARNING,
          description: 'Ingresos por alquiler de propiedades o espacios.',
        },
        {
          name: 'Negocio Propio',
          profile: { id: profileId },
          color: '#1ABC9C',
          type: CategoryType.EARNING,
          description: 'Ingresos generados por un emprendimiento o negocio.',
        },
        {
          name: 'Regalos y Bonificaciones',
          profile: { id: profileId },
          color: '#F39C12',
          type: CategoryType.EARNING,
          description: 'Bonos, comisiones, propinas y regalos recibidos.',
        },
        {
          name: 'Reembolsos',
          profile: { id: profileId },
          color: '#16A085',
          type: CategoryType.EARNING,
          description:
            'Devoluciones de dinero por compras, impuestos o seguros.',
        },
        {
          name: 'Otros Ingresos',
          profile: { id: profileId },
          color: '#7F8C8D',
          type: CategoryType.EARNING,
          description:
            'Ingresos varios que no entran en categorías específicas.',
        },
      ];

      await this.categoriesRepository.insert(baseCategories);

      return {
        success: true,
        message: `${baseCategories.length} base categories created successfully`,
      };
    } catch {
      throw new BadRequestException('The Base Categories Couldnt be created');
    }
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
    await this.categoriesRepository.delete({ id: category.id });
    return category.id;
  }
}
