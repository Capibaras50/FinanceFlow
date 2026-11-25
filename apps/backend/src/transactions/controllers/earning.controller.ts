import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/get-user.decorator';
import { EarningService } from '../services/earning.service';
import { CreateEarningDto } from '../dto/create-earning.dto';
import { UpdateEarningDto } from '../dto/update-earning.dto';
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
import { Earning } from '../entities/earning.entity';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('earnings')
export class EarningController {
  constructor(private earningService: EarningService) {}

  @Get()
  @ApiOkResponse({
    description: 'Return all earnings of authenticated user',
    type: [Earning],
  })
  @ApiBadRequestResponse({
    description: 'Return error Couldnt get anyone earning',
  })
  findAll(
    @GetUser('profileId') profileId: number,
    @Query() filterTransactionDto: FilterTransactionDto,
  ) {
    return this.earningService.findAll(profileId, filterTransactionDto);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: Number,
  })
  @ApiOkResponse({
    description: 'Return one earning of authenticated user',
    type: Earning,
  })
  @ApiNotFoundResponse({
    description: 'Return error not found earning',
  })
  findOne(
    @GetUser('profileId') profileId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.earningService.findOne(id, profileId);
  }

  @Post()
  @ApiBody({
    type: CreateEarningDto,
  })
  @ApiCreatedResponse({
    description: 'Return one earning created',
    type: Earning,
  })
  @ApiBadRequestResponse({
    description: 'Return error Couldnt create earning',
  })
  create(
    @GetUser('profileId') profileId: number,
    @Body() newEarning: CreateEarningDto,
  ) {
    return this.earningService.create(newEarning, profileId);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: Number,
  })
  @ApiBody({ type: UpdateEarningDto })
  @ApiOkResponse({
    description: 'The earning has been updated succesfully',
    type: Earning,
  })
  @ApiBadRequestResponse({
    description: 'Error: The earning couldnt been updated',
  })
  update(
    @GetUser('profileId') profileId: number,
    @Body() updateEarningDto: UpdateEarningDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.earningService.update(id, updateEarningDto, profileId);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiParam({
    name: 'id',
    type: Number,
  })
  @ApiNoContentResponse({
    description: 'The earning is delete',
  })
  @ApiBadRequestResponse({
    description: 'Error: The earning couldnt been deleted',
  })
  remove(
    @GetUser('profileId') profileId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.earningService.remove(id, profileId);
  }
}
