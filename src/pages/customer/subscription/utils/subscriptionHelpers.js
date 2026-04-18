export const STATUS_LABELS = {
  0: 'Pending',
  1: 'Active',
  2: 'Canceled',
  3: 'Expired',
  4: 'Failed',
};

export const STATUS_STYLES = {
  Pending: 'bg-amber-500/15 text-amber-300 border-amber-400/40',
  Active: 'bg-lime-500/15 text-lime-300 border-lime-400/40',
  Canceled: 'bg-zinc-500/15 text-zinc-300 border-zinc-400/30',
  Cancelled: 'bg-zinc-500/15 text-zinc-300 border-zinc-400/30',
  Expired: 'bg-red-500/15 text-red-300 border-red-400/30',
  Failed: 'bg-red-500/15 text-red-300 border-red-400/30',
};

export const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const getStatusLabel = (raw) => {
  if (typeof raw === 'string' && raw.trim()) return raw;
  if (typeof raw === 'number' && STATUS_LABELS[raw]) return STATUS_LABELS[raw];
  return 'Unknown';
};

export const normalizeSubscriptionStatus = (raw) => {
  const label = getStatusLabel(raw);
  const lower = String(label).toLowerCase();
  if (lower === 'active') return 'Active';
  if (lower === 'pending') return 'Pending';
  if (lower === 'cancelled' || lower === 'canceled') return 'Cancelled';
  if (lower === 'expired') return 'Expired';
  if (lower === 'failed') return 'Failed';
  return label;
};

export const getAutoRenewValue = (subscription) => {
  if (!subscription) return null;
  if (typeof subscription.autoRenew === 'boolean') return subscription.autoRenew;
  if (typeof subscription.isAutoRenew === 'boolean') return subscription.isAutoRenew;
  if (typeof subscription.autoRenewEnabled === 'boolean') return subscription.autoRenewEnabled;
  return null;
};

export const getCancelErrorMessage = (error) => {
  const status = error.response?.status;
  if (status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  if (status === 403) return 'Bạn không có quyền thao tác subscription này.';
  if (status === 404) return 'Không tìm thấy subscription.';
  if (status === 400) return 'Trạng thái subscription hiện tại không cho phép hủy.';
  return (
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    'Không thể hủy subscription'
  );
};

export const formatCurrency = (value) => {
  const amount = toNumber(value, 0);
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('vi-VN');
};

export const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('vi-VN');
};

export const getCancelSuccessMessage = (subscription) => {
  const status = normalizeSubscriptionStatus(subscription?.status);
  const autoRenew = getAutoRenewValue(subscription);
  const endDate = subscription?.endDate || subscription?.expiresAt;

  if (status === 'Active' && autoRenew === false) {
    return `Đã tắt gia hạn. Bạn vẫn dùng Premium đến ${formatDate(endDate)}.`;
  }

  if (status === 'Cancelled') {
    return 'Đã hủy subscription.';
  }

  return 'Hủy subscription thành công.';
};
