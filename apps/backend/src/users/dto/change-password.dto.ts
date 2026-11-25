import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'The old secure password of an user',
    example: ']Q-fM}6:uFkk]d,e',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 5,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  currentPassword: string;

  @ApiProperty({
    description: 'The new secure password of an user',
    example: ']Q-fM}6:uFkk]d,e',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 5,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  newPassword: string;
}
