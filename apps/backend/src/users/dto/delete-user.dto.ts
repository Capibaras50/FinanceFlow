import { IsOptional, IsString, IsStrongPassword } from 'class-validator';

export class DeleteUserDto {
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 5,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  @IsOptional()
  password?: string;
}
