import type { ApiClient } from './client';

/** Fechas en formato ISO. El backend las transforma con `@Type(() => Date)`. */
export interface CreateReportDto {
  startDate: string;
  endDate: string;
}

export interface CreateReportResponse {
  jobId?: string;
}

export class ExportsApi {
  constructor(private client: ApiClient) {}

  /** Resumen: una hoja de gastos y otra de ingresos con totales por fecha. */
  createShortReport(dto: CreateReportDto): Promise<CreateReportResponse> {
    return this.client.post<CreateReportResponse>('/exports/short-reports', dto);
  }

  /** Detallado: totales agrupados por categoría y por bolsillo. */
  createLargeReport(dto: CreateReportDto): Promise<CreateReportResponse> {
    return this.client.post<CreateReportResponse>('/exports/large-reports', dto);
  }
}
