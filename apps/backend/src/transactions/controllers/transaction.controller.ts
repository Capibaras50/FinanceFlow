import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/get-user.decorator';
import { TransactionService } from '../services/transaction.service';
import { FilterTransactionDto } from '../dto/filter-transaction.dto';
import { SummaryTransactionDto } from '../dto/summary-transaction.dto';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('transactions')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get('summary')
  @ApiOkResponse({
    description: 'Return summary with totalExpenses, totalEarnings and balance',
    schema: {
      type: 'object',
      properties: {
        totalExpenses: {
          type: 'number',
          example: 1000,
        },
        totalEarnings: {
          type: 'number',
          example: 1000,
        },
        balance: {
          type: 'number',
          example: 0,
        },
      },
    },
  })
  getSummary(
    @GetUser('profileId') profileId: number,
    @Query() summaryTransactionDto: SummaryTransactionDto,
  ) {
    return this.transactionService.getSummary(profileId, summaryTransactionDto);
  }

  @Get()
  @ApiOkResponse({
    description: 'Return the expenses and the earnings in a same timeline',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            example: 1,
          },
          value: {
            type: 'number',
            example: 1000,
          },
          name: {
            type: 'string',
            example: 'New Expense',
          },
          description: {
            type: 'string',
            example: 'Description of new expense',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
          type: {
            type: 'string',
            example: 'expense',
          },
          wallet_id: {
            type: 'number',
            example: 1,
          },
          wallet_name: {
            type: 'string',
            example: 'Wallet Name',
          },
        },
      },
    },
  })
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
