import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Workbook, Worksheet } from 'exceljs';
import { ExpenseService } from 'src/transactions/services/expense.service';
import { EarningService } from 'src/transactions/services/earning.service';
import { CreateShortReportInterface } from '../interfaces/create-short-report.interface';
import { CreateLargeReportInterface } from '../interfaces/create-large-report.interface';
import { buildReportReadyEmail } from '../templates/report-ready.template';
import { CloudinaryService } from 'src/cloudinary/services/cloudinary.service';
import { MailService } from 'src/mail/services/mail.service';
import { UsersService } from 'src/users/services/users.service';
import { ExportReportJob } from '../interfaces/export-report-job.interface';

@Processor('exports')
export class ExportsProcessor extends WorkerHost {
  constructor(
    private expenseService: ExpenseService,
    private earningService: EarningService,
    private cloudinaryService: CloudinaryService,
    private mailService: MailService,
    private usersService: UsersService,
  ) {
    super();
  }

  async process(job: Job<ExportReportJob>) {
    switch (job.data.type) {
      case 'create-short-report':
        return this.createShortReport(job.data);
      case 'create-large-report':
        return this.createLargeReport(job.data);
      default:
        throw new Error(`Job no soportado: ${job.name}`);
    }
  }

  async createShortReport(data: CreateShortReportInterface) {
    try {
      const { profileId, createShortReportDto, userId } = data;

      const workbook = new Workbook();
      const sheetExpenses = workbook.addWorksheet('Gastos');
      const sheetEarnings = workbook.addWorksheet('Ingresos');

      sheetExpenses.columns = [
        { header: 'Fecha', key: 'createdAt', width: 30 },
        { header: 'Valor', key: 'value', width: 30 },
      ];

      sheetEarnings.columns = [
        { header: 'Fecha', key: 'createdAt', width: 30 },
        { header: 'Valor', key: 'value', width: 30 },
      ];

      const expenses = await this.expenseService.findExpensesByDateRange(
        createShortReportDto.startDate,
        createShortReportDto.endDate,
        profileId,
      );

      const earnings = await this.earningService.findEarningsByDateRange(
        createShortReportDto.startDate,
        createShortReportDto.endDate,
        profileId,
      );

      expenses.forEach((expense) => {
        const data = {
          createdAt: expense.createdAt,
          value: Number(expense.value),
        };
        const row = sheetExpenses.addRow(data);
        row.getCell('value').note = expense.name;
      });

      earnings.forEach((earning) => {
        const data = {
          createdAt: earning.createdAt,
          value: Number(earning.value),
        };
        const row = sheetEarnings.addRow(data);
        row.getCell('value').note = earning.name;
      });

      const lastRowExpenses = sheetExpenses.rowCount;
      const lastRowEarnings = sheetEarnings.rowCount;

      const rowTotalExpenses = sheetExpenses.getRow(lastRowExpenses + 1);
      const rowTotalEarnings = sheetEarnings.getRow(lastRowEarnings + 1);

      rowTotalExpenses.getCell('value').value = {
        formula: `SUM(B2:B${lastRowExpenses})`,
      };
      rowTotalEarnings.getCell('value').value = {
        formula: `SUM(B2:B${lastRowEarnings})`,
      };

      rowTotalExpenses.font = { bold: true };
      rowTotalEarnings.font = { bold: true };

      sheetExpenses.getColumn('value').numFmt = '"$"#,##0.00';
      sheetEarnings.getColumn('value').numFmt = '"$"#,##0.00';

      const buffer = await workbook.xlsx.writeBuffer();

      const upload = await this.cloudinaryService.uploadBuffer(buffer, {
        folder: 'finance-flow/reports',
        resource_type: 'raw',
        public_id: `short-report-${profileId}-${Date.now()}.xlsx`,
        type: 'authenticated',
      });

      const downloadUrl = this.cloudinaryService.getPrivateDownloadUrl(
        upload.publicId,
        upload.format,
      );

      const user = await this.usersService.findOne(userId);
      const dateFormatter = new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      const html = buildReportReadyEmail({
        name: user.profile.name,
        downloadUrl,
        startDate: dateFormatter.format(
          new Date(createShortReportDto.startDate),
        ),
        endDate: dateFormatter.format(new Date(createShortReportDto.endDate)),
        expires: '24 horas',
      });

      return this.mailService.sendMessage(
        user.email,
        `Hola ${user.profile.name}, tu reporte de Finance Flow está listo. Descárgalo aquí: ${downloadUrl}`,
        'Tu reporte de Finance Flow está listo',
        html,
      );
    } catch (err) {
      console.error(err);
    }
  }

  async createLargeReport(data: CreateLargeReportInterface) {
    try {
      const { profileId, createLargeReportDto, userId } = data;

      const workbook = new Workbook();
      const sheetExpensesPerCategory = workbook.addWorksheet(
        'Gastos por Categoria',
      );
      const sheetExpensesPerWallet = workbook.addWorksheet(
        'Gastos por Bolsillo',
      );
      const sheetEarningsPerCategory = workbook.addWorksheet(
        'Ingresos por Categoria',
      );
      const sheetEarningsPerWallet = workbook.addWorksheet(
        'Ingresos por Bolsillo',
      );

      sheetExpensesPerCategory.columns = [
        { header: 'Nombre', key: 'name', width: 30 },
        { header: 'Descripcion', key: 'description', width: 30 },
        { header: 'Total', key: 'total', width: 30 },
      ];

      sheetExpensesPerWallet.columns = [
        { header: 'Nombre', key: 'name', width: 30 },
        { header: 'Total', key: 'total', width: 30 },
      ];

      sheetEarningsPerCategory.columns = [
        { header: 'Nombre', key: 'name', width: 30 },
        { header: 'Descripcion', key: 'description', width: 30 },
        { header: 'Total', key: 'total', width: 30 },
      ];

      sheetEarningsPerWallet.columns = [
        { header: 'Nombre', key: 'name', width: 30 },
        { header: 'Total', key: 'total', width: 30 },
      ];

      const expensesPerCategory =
        await this.expenseService.findExpensesGroupedByCategory(
          createLargeReportDto.startDate,
          createLargeReportDto.endDate,
          profileId,
        );
      const expensesPerWallet =
        await this.expenseService.findExpensesGroupedByWallet(
          createLargeReportDto.startDate,
          createLargeReportDto.endDate,
          profileId,
        );
      const earningsPerCategory =
        await this.earningService.findExpensesGroupedByCategory(
          createLargeReportDto.startDate,
          createLargeReportDto.endDate,
          profileId,
        );
      const earningsPerWallet =
        await this.earningService.findExpensesGroupedByWallet(
          createLargeReportDto.startDate,
          createLargeReportDto.endDate,
          profileId,
        );

      // PostgreSQL devuelve SUM(numeric) como string; ExcelJS lo guardaría como texto.
      const numericRows = <T extends { total: number | string }>(rows: T[]) =>
        rows.map((row) => ({ ...row, total: Number(row.total) }));

      const expensesCategoryRows = numericRows(expensesPerCategory);
      const expensesWalletRows = numericRows(expensesPerWallet);
      const earningsCategoryRows = numericRows(earningsPerCategory);
      const earningsWalletRows = numericRows(earningsPerWallet);

      sheetExpensesPerCategory.addRows(expensesCategoryRows);
      sheetEarningsPerCategory.addRows(earningsCategoryRows);
      sheetExpensesPerWallet.addRows(expensesWalletRows);
      sheetEarningsPerWallet.addRows(earningsWalletRows);

      const lastRowExpensesPerCategory = sheetExpensesPerCategory.rowCount;
      const lastRowEarningsPerCategory = sheetEarningsPerCategory.rowCount;
      const lastRowEarningsPerWallet = sheetEarningsPerWallet.rowCount;
      const lastRowExpensesPerWallet = sheetExpensesPerWallet.rowCount;

      const sumTotals = (rows: Array<{ total: number }>) =>
        rows.reduce((sum, row) => sum + row.total, 0);

      const setTotal = (
        sheet: Worksheet,
        lastRow: number,
        columnLetter: string,
        total: number,
      ) => {
        const cell = sheet.getRow(lastRow + 1).getCell('total');
        cell.value =
          lastRow >= 2
            ? {
                formula: `SUM(${columnLetter}2:${columnLetter}${lastRow})`,
                result: total,
              }
            : total;
        cell.font = { bold: true };
      };

      // En las hojas por categoría el total es la columna C (A: nombre, B: descripción).
      setTotal(
        sheetExpensesPerCategory,
        lastRowExpensesPerCategory,
        'C',
        sumTotals(expensesCategoryRows),
      );
      setTotal(
        sheetEarningsPerCategory,
        lastRowEarningsPerCategory,
        'C',
        sumTotals(earningsCategoryRows),
      );
      // En las hojas por bolsillo el total es la columna B.
      setTotal(
        sheetExpensesPerWallet,
        lastRowExpensesPerWallet,
        'B',
        sumTotals(expensesWalletRows),
      );
      setTotal(
        sheetEarningsPerWallet,
        lastRowEarningsPerWallet,
        'B',
        sumTotals(earningsWalletRows),
      );

      sheetExpensesPerCategory.getColumn('total').numFmt = '"$"#,##0.00';
      sheetEarningsPerCategory.getColumn('total').numFmt = '"$"#,##0.00';
      sheetExpensesPerWallet.getColumn('total').numFmt = '"$"#,##0.00';
      sheetEarningsPerWallet.getColumn('total').numFmt = '"$"#,##0.00';

      const buffer = await workbook.xlsx.writeBuffer();

      const upload = await this.cloudinaryService.uploadBuffer(buffer, {
        folder: 'finance-flow/reports',
        resource_type: 'raw',
        public_id: `large-report-${profileId}-${Date.now()}.xlsx`,
        type: 'authenticated',
      });

      const downloadUrl = this.cloudinaryService.getPrivateDownloadUrl(
        upload.publicId,
        upload.format,
      );

      const user = await this.usersService.findOne(userId);
      const dateFormatter = new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      const html = buildReportReadyEmail({
        name: user.profile.name,
        downloadUrl,
        startDate: dateFormatter.format(
          new Date(createLargeReportDto.startDate),
        ),
        endDate: dateFormatter.format(new Date(createLargeReportDto.endDate)),
        expires: '24 horas',
      });

      return this.mailService.sendMessage(
        user.email,
        `Hola ${user.profile.name}, tu reporte de Finance Flow está listo. Descárgalo aquí: ${downloadUrl}`,
        'Tu reporte de Finance Flow está listo',
        html,
      );
    } catch (err) {
      console.error(err);
    }
  }
}
