import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateProfileDto } from './update-profile.dto';
import { Profile } from '../entities/profile.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {
  @ApiPropertyOptional({
    description: 'The profile associated with this user',
    type: () => UpdateProfileDto,
  })
  @ValidateNested()
  @Type(() => UpdateProfileDto)
  @IsOptional()
  profile?: Profile;
}
