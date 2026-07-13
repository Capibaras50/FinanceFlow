import { IsJWT, IsOptional, IsString } from 'class-validator';

export class LogoutDto {
  @IsString()
  @IsOptional()
  @IsJWT()
  refreshToken: string;
}
