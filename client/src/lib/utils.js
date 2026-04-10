import { clsx } from 'clsx';

export const cn = (...inputs) => clsx(inputs);

export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));

export const formatNumber = (value, maximumFractionDigits = 2) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits }).format(Number(value || 0));

export const formatDateTime = (value) =>
  value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '-';
