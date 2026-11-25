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
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ReceiptService } from '../services/receipt.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/services/cloudinary.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Receipt } from '../entities/receipt.entity';
import { FileUploadDto } from 'src/users/dto/file-upload.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('receipts')
export class ReceiptController {
  constructor(
    private receiptService: ReceiptService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: Number,
  })
  @ApiOkResponse({
    description: 'Return one receipt of authenticated user',
    type: Receipt,
  })
  @ApiNotFoundResponse({
    description: 'Return error not found receipt',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('profileId') profileId: number,
  ) {
    return this.receiptService.findOne(id, profileId);
  }

  @Get()
  @ApiQuery({
    name: 'page',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
  })
  @ApiOkResponse({
    description: 'Return all receipts of authenticated user',
    type: [Receipt],
  })
  @ApiBadRequestResponse({
    description: 'Return error Couldnt get anyone receipt',
  })
  findAll(
    @GetUser('profileId') profileId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.receiptService.findAll(profileId, page, limit);
  }

  @Post()
  @UseInterceptors(FileInterceptor('receipt'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Receipt image',
    type: FileUploadDto,
  })
  @ApiCreatedResponse({
    description: 'Return message and queued task',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Start to process the Receipt',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Return error Couldnt queued task',
  })
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
  @ApiParam({
    name: 'id',
    type: Number,
  })
  @ApiNoContentResponse({
    description: 'The receipt is delete',
  })
  @ApiBadRequestResponse({
    description: 'Error: The receipt couldnt been deleted',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('profileId') profileId: number,
  ) {
    return this.receiptService.remove(id, profileId);
  }
}
