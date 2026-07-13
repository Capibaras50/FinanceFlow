import { IsJWT, IsOptional, IsString } from 'class-validator';

export class RefreshDto {
  @IsString()
  @IsOptional()
  @IsJWT()
  refreshToken: string;
}
