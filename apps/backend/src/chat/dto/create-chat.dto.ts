import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @Length(1, 512)
  @IsNotEmpty()
  message: string;
}
