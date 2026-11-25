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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { Debt } from '../entities/debt.entity';
import { FileUploadOptionalDto } from '../dto/file-upload-optional.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('debts')
export class DebtsController {
  constructor(
    private readonly debtsService: DebtsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @ApiBody({ type: CreateDebtDto })
  @ApiCreatedResponse({
    description: 'Return one debt created',
    type: Debt,
  })
  @ApiBadRequestResponse({
    description: 'Return error Couldnt create debt',
  })
  create(
    @GetUser('profileId') profileId: number,
    @Body() createDebtDto: CreateDebtDto,
  ) {
    return this.debtsService.create(profileId, createDebtDto);
  }

  @Get()
  @ApiOkResponse({
    description: 'Return all debts of authenticated user',
    type: [Debt],
  })
  findAll(
    @GetUser('profileId') profileId: number,
    @Query() filterDebtDto: FilterDebtDto,
  ) {
    return this.debtsService.findAll(profileId, filterDebtDto);
  }

  @Get('summary')
  @ApiOkResponse({
    description:
      'Return summary debts of authenticated user, how many receive? and how many pay?',
    schema: {
      type: 'object',
      properties: {
        payableTotal: {
          type: 'number',
          example: 1000,
        },
        receivableTotal: {
          type: 'number',
          example: 1000,
        },
      },
    },
  })
  getSummary(@GetUser('profileId') profileId: number) {
    return this.debtsService.getSummary(profileId);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({
    description: 'Return one debt of authenticated user',
    type: Debt,
  })
  @ApiNotFoundResponse({
    description: 'Return error not found debt',
  })
  findOne(
    @GetUser('profileId') profileId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.debtsService.searchOne(profileId, id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateDebtDto })
  @ApiOkResponse({
    description: 'The debt has been updated succesfully',
    type: Debt,
  })
  @ApiBadRequestResponse({
    description: 'Error: The debt couldnt been updated',
  })
  update(
    @GetUser('profileId') profileId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDebtDto: UpdateDebtDto,
  ) {
    return this.debtsService.update(profileId, id, updateDebtDto);
  }

  @HttpCode(204)
  @Delete(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiNoContentResponse({
    description: 'The debt is delete',
  })
  @ApiBadRequestResponse({
    description: 'Error: The debt couldnt been deleted',
  })
  remove(
    @GetUser('profileId') profileId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.debtsService.remove(profileId, id);
  }

  @Patch(':id/pay')
  @UseInterceptors(FileInterceptor('receipt'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadOptionalDto })
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponse({
    description: 'The debt was pay',
    type: Debt,
  })
  @ApiBadRequestResponse({
    description: 'Error: The debt couldnt been payed',
  })
  async payDebt(
    @GetUser('profileId') profileId: number,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() receipt?: Express.Multer.File,
  ) {
    let receiptUrl: string | undefined = undefined;
    if (receipt) {
      receiptUrl = (await this.cloudinaryService.uploadFile(receipt)) as string;
    }
    return this.debtsService.payDebt(profileId, id, receiptUrl);
  }
}
