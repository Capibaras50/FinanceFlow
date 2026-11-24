import { CreateLargeReportInterface } from './create-large-report.interface';
import { CreateShortReportInterface } from './create-short-report.interface';

export type ExportReportJob =
  CreateShortReportInterface | CreateLargeReportInterface;
