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
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { FindProfilesDto } from '../dto/find-profiles.dto';
import { DeleteUserDto } from '../dto/delete-user.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { Profile } from '../entities/profile.entity';
import { FileUploadDto } from '../dto/file-upload.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'The user has been created succesfully',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Error: The user couldnt been created',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(['admin'])
  @Get()
  @ApiBearerAuth()
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiOkResponse({
    description: 'Shows all users',
    type: [User],
  })
  @ApiUnauthorizedResponse({
    description: 'Unhautorized',
  })
  findAll(@Query('limit') limit?: number, @Query('page') page?: number) {
    return this.usersService.findAll(limit, page);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Show the authenticated user',
    type: User,
  })
  @ApiNotFoundResponse({
    description: 'The user not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unhautorized',
  })
  findOne(@GetUser('userId') userId: number) {
    return this.usersService.findOne(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profiles')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Search profiles by name',
    type: [Profile],
  })
  @ApiUnauthorizedResponse({
    description: 'Unhautorized',
  })
  findAllProfiles(@Query() findAllProfilesDto: FindProfilesDto) {
    return this.usersService.findProfilesByName(findAllProfilesDto.name);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me/profile')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Show the authenticated profile',
    type: Profile,
  })
  @ApiNotFoundResponse({
    description: 'The profile not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unhautorized',
  })
  findOneProfile(@GetUser('userId') userId: number) {
    return this.usersService.findProfileById(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch()
  @ApiBearerAuth()
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: 'The user has been updated succesfully',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Error: The user couldnt been updated',
  })
  @ApiUnauthorizedResponse({
    description: 'Unhautorized',
  })
  update(
    @GetUser('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('avatar'))
  @Post('upload-avatar')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar image',
    type: FileUploadDto,
  })
  @ApiCreatedResponse({
    description: 'The avatar save into cloudinary',
    type: User,
  })
  @ApiUnauthorizedResponse({
    description: 'Unhautorized',
  })
  async uploadAvatar(
    @GetUser('userId') userId: number,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    if (!avatar) {
      throw new BadRequestException('Avatar file is required');
    }
    if (!avatar.mimetype.startsWith('image')) {
      throw new BadRequestException('Avatar file must be an image');
    }
    const avatarUrl = (await this.cloudinaryService.uploadFile(
      avatar,
    )) as string;
    return this.usersService.uploadAvatar(userId, avatarUrl);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('change-password')
  @ApiBearerAuth()
  @ApiBody({ type: ChangePasswordDto })
  @ApiOkResponse({
    description: 'The user authenticated changes his password',
    type: User,
  })
  @ApiUnauthorizedResponse({
    description: 'Unhautorized',
  })
  changePassword(
    @GetUser('userId') userId: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, changePasswordDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete()
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiBody({ type: DeleteUserDto })
  @ApiNoContentResponse({
    description: 'The user authenticated makes a soft delete',
  })
  @ApiUnauthorizedResponse({
    description: 'Unhautorized',
  })
  remove(
    @GetUser('userId') userId: number,
    @Body() deleteUserDto: DeleteUserDto,
  ) {
    return this.usersService.remove(userId, deleteUserDto.password);
  }
}
