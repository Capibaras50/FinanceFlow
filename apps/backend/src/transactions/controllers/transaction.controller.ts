import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/get-user.decorator';
import { TransactionService } from '../services/transaction.service';
import { FilterTransactionDto } from '../dto/filter-transaction.dto';
import { SummaryTransactionDto } from '../dto/summary-transaction.dto';

@Controller('transactions')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('summary')
  getSummary(
    @GetUser('profileId') profileId: number,
    @Query() summaryTransactionDto: SummaryTransactionDto,
  ) {
    return this.transactionService.getSummary(profileId, summaryTransactionDto);
  }

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
