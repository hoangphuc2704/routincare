export const normalizeSubscriptionStatus = (rawStatus) => {
  if (rawStatus === 1 || String(rawStatus).toLowerCase() === 'active') return 'Active';
  if (rawStatus === 0 || String(rawStatus).toLowerCase() === 'pending') return 'Pending';
  if (rawStatus === 2 || ['canceled', 'cancelled'].includes(String(rawStatus).toLowerCase())) {
    return 'Cancelled';
  }
  if (rawStatus === 3 || String(rawStatus).toLowerCase() === 'expired') return 'Expired';
  if (rawStatus === 4 || String(rawStatus).toLowerCase() === 'failed') return 'Failed';
  return 'Unknown';
};

export const formatSubscriptionDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
};

export const visibilityLabel = (value) => {
  if (value === 0) return 'Private';
  if (value === 1) return 'Public';
  if (value === 2) return 'Subscribers';
  return 'Unknown';
};

export const repeatLabel = (repeatType, repeatDays) => {
  if (repeatType === 1) return `Weekly: ${repeatDays || '—'}`;
  return 'Daily';
};

export const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const getCompletionPercent = (overview) => {
  const raw =
    overview?.completionRate ?? overview?.completion_rate_7d ?? overview?.completionRate7d ?? 0;
  const value = toNumber(raw, 0);
  return value <= 1 ? Math.round(value * 100) : Math.round(value);
};

export const isValidUrl = (value) => {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};
