import { PartialType } from '@nestjs/swagger';
import { CreateWalletDto } from './create-wallets.dto';

export class UpdateWalletDto extends PartialType(CreateWalletDto) {}
