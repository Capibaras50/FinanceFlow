import {
  IsString,
  IsEmail,
  IsStrongPassword,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateProfileDto } from './create-profile.dto';
import { Profile } from '../entities/profile.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'The email of an user',
    example: 'example@example.com',
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The secure password of an user',
    example: ']Q-fM}6:uFkk]d,e',
  })
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 5,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'The profile associated with this user',
    type: () => CreateProfileDto,
  })
  @ValidateNested()
  @Type(() => CreateProfileDto)
  profile: Profile;
}
