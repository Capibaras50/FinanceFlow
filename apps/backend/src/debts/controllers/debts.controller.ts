import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { DebtsService } from '../services/debts.service';
import { CreateDebtDto } from '../dto/create-debt.dto';
import { UpdateDebtDto } from '../dto/update-debt.dto';
import { GetUser } from 'src/decorators/get-user.decorator';
import { CloudinaryService } from 'src/cloudinary/services/cloudinary.service';
import { FilterDebtDto } from '../dto/filter-debt.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('debts')
export class DebtsController {
  constructor(
    private readonly debtsService: DebtsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  create(
    @GetUser('profileId') profileId: number,
    @Body() createDebtDto: CreateDebtDto,
  ) {
    return this.debtsService.create(profileId, createDebtDto);
  }

  @Get()
  findAll(
    @GetUser('profileId') profileId: number,
    @Query() filterDebtDto: FilterDebtDto,
  ) {
    return this.debtsService.findAll(profileId, filterDebtDto);
  }

  @Get('summary')
  getSummary(@GetUser('profileId') profileId: number) {
    return this.debtsService.getSummary(profileId);
  }

  @Get(':id')
  findOne(
    @GetUser('profileId') profileId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.debtsService.searchOne(profileId, id);
  }

  @Patch(':id')
  update(
    @GetUser('profileId') profileId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDebtDto: UpdateDebtDto,
  ) {
    return this.debtsService.update(profileId, id, updateDebtDto);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(
    @GetUser('profileId') profileId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.debtsService.remove(profileId, id);
  }

  @Patch(':id/pay')
  @UseInterceptors(FileInterceptor('receipt'))
  async payDebt(
    @GetUser('profileId') profileId: number,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile('receipt') receipt?: Express.Multer.File,
  ) {
    let receiptUrl: string | undefined = undefined;
    if (receipt) {
      receiptUrl = (await this.cloudinaryService.uploadFile(receipt)) as string;
    }
    return this.debtsService.payDebt(profileId, id, receiptUrl);
  }
}
