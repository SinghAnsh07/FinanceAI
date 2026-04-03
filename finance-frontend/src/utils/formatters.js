import { format, parseISO } from 'date-fns';

export const formatCurrency = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount ?? 0);

export const formatDate = (dateStr, fmt = 'MMM d, yyyy') => {
  try { return format(parseISO(dateStr), fmt); }
  catch { return dateStr; }
};

export const capitalize = (str = '') => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const getErrorMsg = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong';

export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
