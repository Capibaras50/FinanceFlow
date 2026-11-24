import { Module } from '@nestjs/common';
import { ExportsService } from './services/exports.service';
import { ExportsController } from './controllers/exports.controller';
import { TransactionsBaseModule } from 'src/transactions/transactions-base.module';
import { BullModule } from '@nestjs/bullmq';
import { ExportsProcessor } from 'src/exports/processors/export.processor';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { MailModule } from 'src/mail/mail.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TransactionsBaseModule,
    BullModule.registerQueueAsync({ name: 'exports' }),
    CloudinaryModule,
    MailModule,
    UsersModule,
  ],
  controllers: [ExportsController],
  providers: [ExportsService, ExportsProcessor],
})
export class ExportsModule {}
