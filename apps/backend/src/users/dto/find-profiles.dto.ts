import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class FindProfilesDto {
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  name: string;
}
