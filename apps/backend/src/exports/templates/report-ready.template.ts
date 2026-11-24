import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface ReportReadyEmailData {
  name: string;
  downloadUrl: string;
  startDate: string;
  endDate: string;
  expires: string;
}

const TEMPLATE_PATH = join(
  process.cwd(),
  'assets',
  'templates',
  'report-ready.html',
);

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function buildReportReadyEmail(data: ReportReadyEmailData): string {
  const template = readFileSync(TEMPLATE_PATH, 'utf8');
  const values: Record<string, string> = {
    '{{NAME}}': data.name,
    '{{DOWNLOAD_URL}}': data.downloadUrl,
    '{{START_DATE}}': data.startDate,
    '{{END_DATE}}': data.endDate,
    '{{EXPIRES}}': data.expires,
    '{{YEAR}}': String(new Date().getFullYear()),
  };

  return Object.entries(values).reduce(
    (html, [placeholder, value]) =>
      html.replaceAll(placeholder, escapeHtml(value)),
    template,
  );
}
