import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExpenseService } from '../services/expense.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/get-user.decorator';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';
import { FilterTransactionDto } from '../dto/filter-transaction.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Expense } from '../entities/expense.entity';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('expenses')
export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: Number,
  })
  @ApiOkResponse({
    description: 'Return one expense of authenticated user',
    type: Expense,
  })
  @ApiNotFoundResponse({
    description: 'Return error not found expense',
  })
  findOne(
    @GetUser('profileId') profileId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.expenseService.findOne(id, profileId);
  }

  @Get()
  @ApiOkResponse({
    description: 'Return all expenses of authenticated user',
    type: [Expense],
  })
  @ApiBadRequestResponse({
    description: 'Return error Couldnt get anyone expense',
  })
  findAll(
    @GetUser('profileId') profileId: number,
    @Query() filterTransactionDto: FilterTransactionDto,
  ) {
    return this.expenseService.findAll(profileId, filterTransactionDto);
  }

  @Post()
  @ApiBody({
    type: CreateExpenseDto,
  })
  @ApiCreatedResponse({
    description: 'Return one expense created',
    type: Expense,
  })
  @ApiBadRequestResponse({
    description: 'Return error Couldnt create expense',
  })
  create(
    @GetUser('profileId') profileId: number,
    @Body() newExpense: CreateExpenseDto,
  ) {
    return this.expenseService.create(newExpense, profileId);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: Number,
  })
  @ApiBody({ type: UpdateExpenseDto })
  @ApiOkResponse({
    description: 'The expense has been updated succesfully',
    type: Expense,
  })
  @ApiBadRequestResponse({
    description: 'Error: The expense couldnt been updated',
  })
  update(
    @GetUser('profileId') profileId: number,
    @Body() changes: UpdateExpenseDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.expenseService.update(id, profileId, changes);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: Number,
  })
  @ApiNoContentResponse({
    description: 'The expense is delete',
  })
  @ApiBadRequestResponse({
    description: 'Error: The expense couldnt been deleted',
  })
  remove(
    @GetUser('profileId') profileId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.expenseService.remove(id, profileId);
  }
}
