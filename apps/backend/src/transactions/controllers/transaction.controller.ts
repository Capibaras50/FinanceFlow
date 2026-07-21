import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/get-user.decorator';
import { TransactionService } from '../services/transaction.service';
import { FilterTransactionDto } from '../dto/filter-transaction.dto';

@Controller('transactions')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  getTransactionsTimeline(
    @GetUser('profileId') profileId: number,
    @Query() filterTransactionDto: FilterTransactionDto,
  ) {
    return this.transactionService.getTransactionsTimeline(
      profileId,
      filterTransactionDto,
    );
  }
}
