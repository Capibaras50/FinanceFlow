import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../decorators/get-user.decorator';
import { ChangePasswordDto } from '../dto/change-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  findOne(@GetUser('userId') userId: number) {
    return this.usersService.findOne(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me/profile')
  findOneProfile(@GetUser('userId') userId: number) {
    return this.usersService.findProfileById(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch()
  update(
    @GetUser('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch()
  changePassword(
    @GetUser('userId') userId: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, changePasswordDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete()
  @HttpCode(204)
  remove(@GetUser('userId') userId: number) {
    return this.usersService.remove(userId);
  }
}
