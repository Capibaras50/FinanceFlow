import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class FindProfilesDto {
  @ApiProperty({
    description: 'The name of any user',
    example: 'Andres',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @IsNotEmpty()
  name: string;
}
