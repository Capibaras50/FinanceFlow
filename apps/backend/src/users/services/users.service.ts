import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { DeepPartial, ILike, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesService } from 'src/categories/services/categories.service';
import { WalletsService } from 'src/wallets/services/wallets.service';
import { compare, hash } from 'bcrypt';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { CreateUserGoogleDto } from '../dto/create-user-google.dto';
import { Profile } from '../entities/profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
    private categoriesService: CategoriesService,
    private walletsService: WalletsService,
  ) {}
  async findAll(take?: number, page?: number) {
    const users = await this.usersRepository.find({
      where: { deletedAt: undefined },
      take: take || 10,
      skip: ((page ?? 1) - 1) * (take || 10),
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
      await this.walletsService.createBaseWallets(newUser.profile.id);
      return this.findOne(newUser.id);
    } catch {
      throw new BadRequestException('The user couldnt be created');
    }
  }

  async createWithGoogle(createUserGoogleDto: CreateUserGoogleDto) {
    const newUser: DeepPartial<User> = {
      email: createUserGoogleDto.email,
      password: undefined,
      profile: {
        name: createUserGoogleDto.name,
        avatarUrl: createUserGoogleDto.avatarUrl,
      },
    };
    const user = this.usersRepository.create(newUser);
    const savedUser = await this.usersRepository.save(user);
    await this.categoriesService.createBaseCateogories(savedUser.profile.id);
    await this.walletsService.createBaseWallets(savedUser.profile.id);
    return this.findOne(savedUser.id);
  }

  async saveRecoveryToken(id: number, hashRecoveryToken: string) {
    const user = await this.findOne(id);
    const recoveryTokenExpiresAt = new Date();
    recoveryTokenExpiresAt.setMinutes(recoveryTokenExpiresAt.getMinutes() + 15);
    const mergedUser = this.usersRepository.merge(user, {
      recoveryTokenHash: hashRecoveryToken,
      recoveryTokenExpiresAt,
    });
    return await this.usersRepository.save(mergedUser);
  }

  async uploadAvatar(id: number, avatarUrl: string) {
    const user = await this.findOne(id);
    const mergedUser = this.usersRepository.merge(user, {
      profile: { avatarUrl },
    });
    return await this.usersRepository.save(mergedUser);
  }

  async findUserByRecoveryToken(hashRecoveryToken: string) {
    const user = await this.usersRepository.findOne({
      where: {
        recoveryTokenHash: hashRecoveryToken,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid Recovery Token');
    }
    return user;
  }

  async findProfilesByName(name: string) {
    return this.profilesRepository.find({
      where: {
        name: ILike(`%${name}%`),
      },
    });
  }

  async recoveryPassword(id: number, hashPassword: string) {
    const user = await this.findOne(id);
    const mergedUser = this.usersRepository.merge(user, {
      password: hashPassword,
      recoveryTokenExpiresAt: null,
      recoveryTokenHash: null,
    });
    await this.usersRepository.save(mergedUser);
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

  async changePassword(id: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.findOne(id);
    if (!user || !user.password) {
      throw new UnauthorizedException();
    }
    const isMatch = await compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isMatch) {
      throw new UnauthorizedException();
    }
    const hashPassword = await hash(changePasswordDto.newPassword, 10);
    const mergedUser = this.usersRepository.merge(user, {
      password: hashPassword,
    });
    return await this.usersRepository.save(mergedUser);
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
