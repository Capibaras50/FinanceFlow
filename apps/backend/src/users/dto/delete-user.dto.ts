import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsStrongPassword } from 'class-validator';

export class DeleteUserDto {
  @ApiPropertyOptional({
    description: 'The secure password of user',
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
  @IsOptional()
  password?: string;
}
