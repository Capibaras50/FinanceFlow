"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const category_entity_1 = require("../entities/category.entity");
const typeorm_2 = require("typeorm");
let CategoriesService = class CategoriesService {
    categoriesRepository;
    constructor(categoriesRepository) {
        this.categoriesRepository = categoriesRepository;
    }
    async create(createCategoryDto, profileId) {
        try {
            const category = {
                ...createCategoryDto,
                profile: { id: profileId },
            };
            const createdCategory = this.categoriesRepository.create(category);
            const newCategory = await this.categoriesRepository.save(createdCategory);
            return newCategory;
        }
        catch {
            throw new common_1.BadRequestException('The Category could not be created');
        }
    }
    async findAll(profileId) {
        const categories = this.categoriesRepository.find({
            where: { profile: { id: profileId } },
        });
        return categories;
    }
    async findByIds(categoriesId, profileId) {
        const categories = await this.categoriesRepository.find({
            where: {
                id: (0, typeorm_2.In)(categoriesId),
                profile: { id: profileId },
            },
        });
        if (categories.length !== categoriesId.length) {
            throw new common_1.NotFoundException('Some categories were not found');
        }
        return categories;
    }
    async findOne(id, profileId) {
        const category = await this.categoriesRepository.findOne({
            where: {
                profile: { id: profileId },
                id,
            },
        });
        if (!category) {
            throw new common_1.NotFoundException('The Category Not found');
        }
        return category;
    }
    async findByName(name, profileId) {
        const categories = await this.findAll(profileId);
        const filteredCategories = categories.filter((category) => category.name.toLowerCase().includes(name.toLowerCase()));
        const idsCategories = filteredCategories.map((category) => category.id);
        return idsCategories ?? [categories[0].id];
    }
    async createBaseCateogories(profileId) {
        try {
            const baseCategories = [
                {
                    name: 'Vivienda',
                    profile: { id: profileId },
                    color: '#FF5733',
                    description: 'Alquiler, hipoteca, servicios públicos e internet.',
                },
                {
                    name: 'Alimentación',
                    profile: { id: profileId },
                    color: '#2ECC71',
                    description: 'Compras de supermercado y víveres para el hogar.',
                },
                {
                    name: 'Transporte',
                    profile: { id: profileId },
                    color: '#3498DB',
                    description: 'Transporte público, combustible y mantenimiento de vehículos.',
                },
                {
                    name: 'Salud',
                    profile: { id: profileId },
                    color: '#E74C3C',
                    description: 'Gastos médicos, farmacia y seguros.',
                },
                {
                    name: 'Restaurantes',
                    profile: { id: profileId },
                    color: '#F1C40F',
                    description: 'Comida fuera de casa, cafés y domicilios.',
                },
                {
                    name: 'Suscripciones',
                    profile: { id: profileId },
                    color: '#9B59B6',
                    description: 'Plataformas de streaming, software y servicios digitales.',
                },
                {
                    name: 'Ocio y Cultura',
                    profile: { id: profileId },
                    color: '#E67E22',
                    description: 'Cine, libros, videojuegos y entretenimiento en general.',
                },
                {
                    name: 'Compras',
                    profile: { id: profileId },
                    color: '#1ABC9C',
                    description: 'Ropa, calzado y artículos personales o para el hogar.',
                },
                {
                    name: 'Educación',
                    profile: { id: profileId },
                    color: '#34495E',
                    description: 'Cursos, materiales de estudio y formación profesional.',
                },
                {
                    name: 'Ahorro e Inversión',
                    profile: { id: profileId },
                    color: '#27AE60',
                    description: 'Fondos de emergencia, inversiones y ahorro a largo plazo.',
                },
                {
                    name: 'Deudas',
                    profile: { id: profileId },
                    color: '#C0392B',
                    description: 'Pago de tarjetas de crédito y préstamos pendientes.',
                },
                {
                    name: 'Otros',
                    profile: { id: profileId },
                    color: '#95A5A6',
                    description: 'Gastos varios que no entran en categorías específicas.',
                },
            ];
            await this.categoriesRepository.insert(baseCategories);
            return {
                success: true,
                message: `${baseCategories.length} base categories created successfully`,
            };
        }
        catch {
            throw new common_1.BadRequestException('The Base Categories Couldnt be created');
        }
    }
    async update(id, updateCategoryDto, profileId) {
        try {
            const category = await this.findOne(id, profileId);
            const mergedCategory = this.categoriesRepository.merge(category, updateCategoryDto);
            const savedCategory = await this.categoriesRepository.save(mergedCategory);
            return savedCategory;
        }
        catch {
            throw new common_1.BadRequestException('The Category Could Not Be Updated');
        }
    }
    async remove(id, profileId) {
        const category = await this.findOne(id, profileId);
        await this.categoriesRepository.delete({ id: category.id });
        return category.id;
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map