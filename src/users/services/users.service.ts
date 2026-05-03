import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesService } from 'src/categories/services/categories.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private categoriesService: CategoriesService,
  ) {}
  async findAll() {
    const users = await this.usersRepository.find({
      where: { deletedAt: undefined },
    });
    return users;
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id, deletedAt: undefined },
      relations: ['profile'],
    });
    if (!user) {
      throw new NotFoundException('The user not found');
    }
    return user;
  }

  async findProfileById(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id, deletedAt: undefined },
      relations: ['profile'],
    });
    if (!user) {
      throw new NotFoundException('The user not found');
    }
    return user.profile;
  }

  async findUserByEmail(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email, deletedAt: undefined },
      relations: ['profile'],
    });
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const createdUser = this.usersRepository.create(createUserDto);
      const newUser = await this.usersRepository.save(createdUser);
      await this.categoriesService.createBaseCateogories(newUser.profile.id);
      return newUser;
    } catch {
      throw new BadRequestException('The user couldnt be created');
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.findOne(id);
      const mergedUser = this.usersRepository.merge(user, updateUserDto);
      const updatedUser = await this.usersRepository.save(mergedUser);
      return updatedUser;
    } catch {
      throw new BadRequestException('The user couldnt be updated');
    }
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    const mergedUser = this.usersRepository.merge(user, {
      deletedAt: new Date(),
    });
    const savedUser = await this.usersRepository.save(mergedUser);
    return { id: savedUser.id };
  }
}
