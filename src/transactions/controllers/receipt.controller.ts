import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ReceiptService } from '../services/receipt.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/get-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('receipts')
export class ReceiptController {
  constructor(private receiptService: ReceiptService) {}

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('profileId') profileId: number,
  ) {
    return this.receiptService.findOne(id, profileId);
  }

  @Get()
  findAll(@GetUser('profileId') profileId: number) {
    return this.receiptService.findAll(profileId);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('profileId') profileId: number,
  ) {
    return this.receiptService.remove(id, profileId);
  }
}
