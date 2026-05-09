import { Controller, UseGuards } from '@nestjs/common';
import { ReceiptService } from '../services/receipt.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('receipts')
export class ReceiptController {
  constructor(private receiptService: ReceiptService) {}
}
