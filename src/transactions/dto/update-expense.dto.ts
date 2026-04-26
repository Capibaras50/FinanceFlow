import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionDto } from './create-expense.dto';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {}
