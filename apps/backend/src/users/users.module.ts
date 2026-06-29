import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { CategoriesModule } from 'src/categories/categories.module';
import { WalletsModule } from 'src/wallets/wallets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile]),
    CategoriesModule,
    WalletsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
