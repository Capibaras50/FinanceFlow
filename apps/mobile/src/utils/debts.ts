import type { Debt, DebtDirection, DebtPriority, DebtStatus, DebtType, Contact, Profile } from '@finance-flow/shared-types';

export const DEBT_TYPE_LABELS: Record<DebtType, string> = {
  personal: 'Personal',
  bank: 'Banco',
  credit_card: 'Tarjeta',
  loan: 'Préstamo',
  commercial: 'Comercial',
  fiscal: 'Fiscal',
  other: 'Otro',
};

export const DEBT_STATUS_LABELS: Record<DebtStatus, string> = {
  pending: 'Pendiente',
  paid: 'Pagada',
  overdue: 'Vencida',
  cancelled: 'Cancelada',
};

export const DEBT_PRIORITY_LABELS: Record<DebtPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

export function getOtherProfile(contact: Contact, myProfileId: number): Profile {
  if (contact.requester && contact.requester.id === myProfileId) {
    return contact.addressee;
  }
  return contact.requester ?? contact.addressee;
}

export function isDebtMine(debt: Debt, myProfileId: number): boolean {
  if (!debt.contact) return true;
  if (debt.contact.requester.id === myProfileId) return true;
  if (debt.contact.addressee.id === myProfileId) return false;
  return true;
}

export function getMyDirection(debt: Debt, myProfileId: number): DebtDirection {
  return isDebtMine(debt, myProfileId) ? debt.direction : (debt.direction === 'receivable' ? 'payable' : 'receivable');
}

export function formatInterestRate(rate: number | null | undefined): string | null {
  if (rate == null) return null;
  return `${Math.round(Number(rate) * 100)}%`;
}

export function isDebtOutstanding(status: DebtStatus): boolean {
  return status === 'pending' || status === 'overdue';
}
