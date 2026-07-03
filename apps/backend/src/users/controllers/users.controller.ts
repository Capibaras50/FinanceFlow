import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  HttpCode,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../../decorators/get-user.decorator';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/services/cloudinary.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Query('limit') limit?: number, @Query('page') page?: number) {
    return this.usersService.findAll(limit, page);
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
  @UseInterceptors(FileInterceptor('avatar'))
  @Post('upload-avatar')
  async uploadAvatar(
    @GetUser('userId') userId: number,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    if (!avatar) {
      throw new BadRequestException('Avatar file is required');
    }
    const avatarUrl = (await this.cloudinaryService.uploadFile(
      avatar,
    )) as string;
    return this.usersService.uploadAvatar(userId, avatarUrl);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('change-password')
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
