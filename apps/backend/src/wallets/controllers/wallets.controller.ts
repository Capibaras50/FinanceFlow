import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { WalletsService } from '../services/wallets.service';
import { CreateWalletDto } from '../dto/create-wallets.dto';
import { UpdateWalletDto } from '../dto/update-wallets.dto';
import { GetUser } from 'src/decorators/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  create(
    @Body() createWalletDto: CreateWalletDto,
    @GetUser('profileId') profileId: number,
  ) {
    return this.walletsService.create(createWalletDto, profileId);
  }

  @Get()
  findAll(
    @GetUser('profileId') profileId: number,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    return this.walletsService.findAll(profileId, limit, page);
  }

  @Get('balance')
  getBalance(@GetUser('profileId') profileId: number) {
    return this.walletsService.getWalletBalance(profileId);
  }

  @Get('balance/:id')
  getBalanceById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('profileId') profileId: number,
  ) {
    return this.walletsService.getWalletBalance(profileId, id);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('profileId') profileId: number,
  ) {
    return this.walletsService.findOne(id, profileId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWalletDto: UpdateWalletDto,
    @GetUser('profileId') profileId: number,
  ) {
    return this.walletsService.update(id, updateWalletDto, profileId);
  }

  @HttpCode(204)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('profileId') profileId: number,
  ) {
    return this.walletsService.remove(id, profileId);
  }
}
