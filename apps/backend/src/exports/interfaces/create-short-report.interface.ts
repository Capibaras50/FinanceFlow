import { CreateShortReportDto } from '../dto/create-short-report.dto';

export interface CreateShortReportInterface {
  type: 'create-short-report';
  profileId: number;
  createShortReportDto: CreateShortReportDto;
  userId: number;
}
