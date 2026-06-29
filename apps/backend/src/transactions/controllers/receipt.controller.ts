import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ReceiptService } from '../services/receipt.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/services/cloudinary.service';

@UseGuards(AuthGuard('jwt'))
@Controller('receipts')
export class ReceiptController {
  constructor(
    private receiptService: ReceiptService,
    private cloudinaryService: CloudinaryService,
  ) {}

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

  @Post()
  @UseInterceptors(FileInterceptor('receipt'))
  async create(
    @GetUser('profileId') profileId: number,
    @UploadedFile() receipt: Express.Multer.File,
  ) {
    if (!receipt) {
      throw new BadRequestException('Receipt file is required');
    }
    const receiptUrl = (await this.cloudinaryService.uploadFile(
      receipt,
    )) as string;
    return this.receiptService.create(receiptUrl, profileId);
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
