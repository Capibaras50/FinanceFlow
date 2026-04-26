import { PartialType } from '@nestjs/mapped-types';
import { CreateWalletDto } from './create-wallets.dto';

export class UpdateWalletDto extends PartialType(CreateWalletDto) {}
