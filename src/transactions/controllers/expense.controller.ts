import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ExpenseService } from '../services/expense.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/get-user.decorator';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { UpdateExpenseDto } from '../dto/update-expense.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('expenses')
export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  @Get(':id')
  findOne(
    @GetUser('profileId') profileId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.expenseService.findOne(id, profileId);
  }

  @Get()
  findAll(@GetUser('profileId') profileId: number) {
    return this.expenseService.findAll(profileId);
  }

  @Post()
  create(
    @GetUser('profileId') profileId: number,
    @Body() newExpense: CreateExpenseDto,
  ) {
    return this.expenseService.create(newExpense, profileId);
  }

  @Patch(':id')
  update(
    @GetUser('profileId') profileId: number,
    @Body() changes: UpdateExpenseDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.expenseService.update(id, profileId, changes);
  }

  @Delete(':id')
  remove(
    @GetUser('profileId') profileId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.expenseService.remove(id, profileId);
  }
}
