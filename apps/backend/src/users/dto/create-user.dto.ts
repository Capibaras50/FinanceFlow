import {
  IsString,
  IsEmail,
  IsStrongPassword,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProfileDto } from './create-profile.dto';
import { Profile } from '../entities/profile.entity';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

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

  @ValidateNested()
  @Type(() => CreateProfileDto)
  profile: Profile;
}
