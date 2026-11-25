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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Wallet } from '../entities/wallets.entity';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  @ApiBody({ type: CreateWalletDto })
  @ApiCreatedResponse({
    description: 'The wallet has been created succesfully',
    type: Wallet,
  })
  @ApiBadRequestResponse({
    description: 'Error: The wallet couldnt been created',
  })
  create(
    @Body() createWalletDto: CreateWalletDto,
    @GetUser('profileId') profileId: number,
  ) {
    return this.walletsService.create(createWalletDto, profileId);
  }

  @Get()
  @ApiQuery({ name: 'limit', type: Number })
  @ApiQuery({ name: 'page', type: Number })
  @ApiOkResponse({
    description: 'Shows all wallets of authenticated user',
    type: [Wallet],
  })
  findAll(
    @GetUser('profileId') profileId: number,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    return this.walletsService.findAll(profileId, limit, page);
  }

  @Get('balance')
  @ApiOkResponse({
    description: 'Return balance, totalExpenses, totalEarnings for each wallet',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            example: 1,
          },
          name: {
            type: 'string',
            example: 'Wallet Name',
          },
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
    },
  })
  getBalance(@GetUser('profileId') profileId: number) {
    return this.walletsService.getWalletBalance(profileId);
  }

  @Get('balance/:id')
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({
    description: 'Return balance, total expenses, total earnings of one wallet',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          example: 1,
        },
        name: {
          type: 'string',
          example: 'Wallet Name',
        },
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
  getBalanceById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('profileId') profileId: number,
  ) {
    return this.walletsService.getWalletBalance(profileId, id);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({
    description: 'Return one wallet of authenticated user',
    type: Wallet,
  })
  @ApiNotFoundResponse({
    description: 'Return error not found wallet',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('profileId') profileId: number,
  ) {
    return this.walletsService.findOne(id, profileId);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateWalletDto })
  @ApiOkResponse({
    description: 'The wallet has been updated succesfully',
    type: Wallet,
  })
  @ApiBadRequestResponse({
    description: 'Error: The wallet couldnt been updated',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWalletDto: UpdateWalletDto,
    @GetUser('profileId') profileId: number,
  ) {
    return this.walletsService.update(id, updateWalletDto, profileId);
  }

  @HttpCode(204)
  @Delete(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse({
    description: 'The wallet is delete',
  })
  @ApiBadRequestResponse({
    description: 'Error: The wallet couldnt been deleted',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('profileId') profileId: number,
  ) {
    return this.walletsService.remove(id, profileId);
  }
}
