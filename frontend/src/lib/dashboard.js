export function extractCollection(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

export function formatCurrency(value, currency = 'MAD') {
  return new Intl.NumberFormat('en-MA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatCompactNumber(value) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

export function formatDate(value, options = {}) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(value));
}

export function formatMonthLabel(value) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
  }).format(new Date(value));
}

export function statusTone(status) {
  switch ((status || '').toLowerCase()) {
    case 'active':
    case 'accepted':
    case 'paid':
    case 'completed':
    case 'verified':
      return 'bg-emerald-50 text-emerald-700';
    case 'pending':
    case 'processing':
    case 'review':
      return 'bg-amber-50 text-amber-700';
    case 'cancelled':
    case 'rejected':
    case 'inactive':
      return 'bg-rose-50 text-rose-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}
