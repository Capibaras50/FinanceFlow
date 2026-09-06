// Intl.NumberFormat instantiation is expensive; cache a single instance.
const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
});

export function formatCurrency(value: number): string {
  if (isNaN(value) || !isFinite(value)) return '$0.00';
  return currencyFormatter.format(value);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays === 7) return 'Hace 1 semana';

  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
  });
}

export function getCategoryColor(color: string): string {
  return color || '#7C3AED';
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const msg = (error as { message: unknown }).message;
    if (typeof msg === 'string') return msg;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export function formatCurrencyInput(text: string): string {
  const cleaned = text.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return formatCurrencyInput(parts[0] + '.' + parts.slice(1).join(''));
  }
  const [integerPart, decimalPart] = parts;
  const formattedInt = (integerPart.replace(/^0+/, '') || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (decimalPart !== undefined) {
    return formattedInt + '.' + decimalPart.slice(0, 2);
  }
  return formattedInt === '0' && cleaned !== '0' && cleaned !== '' ? '' : formattedInt;
}

export function parseCurrencyInput(text: string): string {
  return text.replace(/,/g, '');
}
