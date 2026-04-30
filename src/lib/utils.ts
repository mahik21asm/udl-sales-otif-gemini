import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(v: number) {
  if (v === undefined || v === null) return '0';
  return v.toLocaleString('en-IN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
}

export function formatCurrency(v: number) {
  if (v === undefined || v === null) return '₹0.0';
  return '₹' + v.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function formatDate(date: string | Date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
