import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Receipt } from '../entities/receipt.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ReceiptService {
  constructor(
    @InjectRepository(Receipt)
    private receiptRepository: Repository<Receipt>,
  ) {}
}
