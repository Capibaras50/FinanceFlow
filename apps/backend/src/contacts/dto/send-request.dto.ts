import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class SendRequestDto {
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  addresseeId: number;
}
