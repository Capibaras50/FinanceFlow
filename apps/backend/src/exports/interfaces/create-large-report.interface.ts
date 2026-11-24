import { CreateLargeReportDto } from '../dto/create-large-report.dto';

export interface CreateLargeReportInterface {
  type: 'create-large-report';
  profileId: number;
  createLargeReportDto: CreateLargeReportDto;
  userId: number;
}
