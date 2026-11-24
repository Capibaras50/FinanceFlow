import { Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { CreateShortReportDto } from '../dto/create-short-report.dto';
import { CreateLargeReportDto } from '../dto/create-large-report.dto';
import { ExportReportJob } from '../interfaces/export-report-job.interface';

@Injectable()
export class ExportsService {
  constructor(
    @InjectQueue('exports')
    private readonly queue: Queue<ExportReportJob>,
  ) {}

  async createShortReport(
    profileId: number,
    createShortReportDto: CreateShortReportDto,
    userId: number,
  ) {
    const job = await this.queue.add(
      'create-short-report',
      { type: 'create-short-report', profileId, createShortReportDto, userId },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnFail: false,
        removeOnComplete: true,
      },
    );

    return { jobId: job.id };
  }

  async createLargeReport(
    profileId: number,
    createLargeReportDto: CreateLargeReportDto,
    userId: number,
  ) {
    const job = await this.queue.add(
      'create-large-report',
      { type: 'create-large-report', profileId, createLargeReportDto, userId },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnFail: false,
        removeOnComplete: true,
      },
    );

    return { jobId: job.id };
  }
}
