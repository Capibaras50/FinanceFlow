import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
