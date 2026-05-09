import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateProfileDto } from './update-profile.dto';
import { Profile } from '../entities/profile.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ValidateNested()
  @Type(() => UpdateProfileDto)
  @IsOptional()
  profile?: Profile;
}
