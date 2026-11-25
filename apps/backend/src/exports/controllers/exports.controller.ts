import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExportsService } from '../services/exports.service';
import { GetUser } from 'src/decorators/get-user.decorator';
import { CreateShortReportDto } from '../dto/create-short-report.dto';
import { CreateLargeReportDto } from '../dto/create-large-report.dto';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('exports')
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Post('short-reports')
  @ApiBody({ type: CreateShortReportDto })
  @ApiCreatedResponse({
    description: 'Queued a task for generate a short report',
    schema: {
      type: 'object',
      properties: {
        jobId: {
          type: 'string',
          example: '1',
        },
      },
    },
  })
  createShortReport(
    @Body() createShortReportDto: CreateShortReportDto,
    @GetUser('profileId') profileId: number,
    @GetUser('userId') userId: number,
  ) {
    return this.exportsService.createShortReport(
      profileId,
      createShortReportDto,
      userId,
    );
  }

  @Post('large-reports')
  @ApiBody({ type: CreateLargeReportDto })
  @ApiCreatedResponse({
    description: 'Queued a task for generate a large report',
    schema: {
      type: 'object',
      properties: {
        jobId: {
          type: 'string',
          example: '1',
        },
      },
    },
  })
  createLargeReport(
    @Body() createLargeReportDto: CreateLargeReportDto,
    @GetUser('profileId') profileId: number,
    @GetUser('userId') userId: number,
  ) {
    return this.exportsService.createLargeReport(
      profileId,
      createLargeReportDto,
      userId,
    );
  }
}
