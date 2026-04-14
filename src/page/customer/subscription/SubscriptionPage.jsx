import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Crown, ExternalLink, History, Loader2, Wallet, XCircle } from 'lucide-react';
import { message, Modal } from 'antd';
import BottomNav from '../../../components/BottomNav';
import subscriptionApi from '../../../api/subscriptionApi';
import paymentApi from '../../../api/paymentApi';
import { getUser, setUser } from '../../../utils/tokenService';

const STATUS_LABELS = {
  0: 'Pending',
  1: 'Active',
  2: 'Canceled',
  3: 'Expired',
  4: 'Failed',
};

const STATUS_STYLES = {
  Pending: 'bg-amber-500/15 text-amber-300 border-amber-400/40',
  Active: 'bg-lime-500/15 text-lime-300 border-lime-400/40',
  Canceled: 'bg-zinc-500/15 text-zinc-300 border-zinc-400/30',
  Cancelled: 'bg-zinc-500/15 text-zinc-300 border-zinc-400/30',
  Expired: 'bg-red-500/15 text-red-300 border-red-400/30',
  Failed: 'bg-red-500/15 text-red-300 border-red-400/30',
};

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const getStatusLabel = (raw) => {
  if (typeof raw === 'string' && raw.trim()) return raw;
  if (typeof raw === 'number' && STATUS_LABELS[raw]) return STATUS_LABELS[raw];
  return 'Unknown';
};

const normalizeSubscriptionStatus = (raw) => {
  const label = getStatusLabel(raw);
  const lower = String(label).toLowerCase();
  if (lower === 'active') return 'Active';
  if (lower === 'pending') return 'Pending';
  if (lower === 'cancelled' || lower === 'canceled') return 'Cancelled';
  if (lower === 'expired') return 'Expired';
  if (lower === 'failed') return 'Failed';
  return label;
};

const getAutoRenewValue = (subscription) => {
  if (!subscription) return null;
  if (typeof subscription.autoRenew === 'boolean') return subscription.autoRenew;
  if (typeof subscription.isAutoRenew === 'boolean') return subscription.isAutoRenew;
  if (typeof subscription.autoRenewEnabled === 'boolean') return subscription.autoRenewEnabled;
  return null;
};

const getCancelErrorMessage = (error) => {
  const status = error.response?.status;
  if (status === 401) return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  if (status === 403) return 'Bạn không có quyền thao tác subscription này.';
  if (status === 404) return 'Không tìm thấy subscription.';
  if (status === 400) return 'Trạng thái subscription hiện tại không cho phép hủy.';
  return error.response?.data?.error?.message || error.response?.data?.message || 'Không thể hủy subscription';
};

const getCancelSuccessMessage = (subscription) => {
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

const formatCurrency = (value) => {
  const amount = toNumber(value, 0);
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('vi-VN');
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('vi-VN');
};

export default function SubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [isVerifyingReturn, setIsVerifyingReturn] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const pollIntervalRef = useRef(null);
  const pollAttemptsRef = useRef(0);
  const lastPollTriggerRef = useRef(0);

  const fetchPlans = async () => {
    try {
      setPlansLoading(true);
      const res = await subscriptionApi.getPlans();
      const data = res.data?.data || res.data;
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
      message.error('Không tải được danh sách gói');
    } finally {
      setPlansLoading(false);
    }
  };

  const fetchCurrentSubscription = async (options = {}) => {
    const { silent = false } = options;
    try {
      if (!silent) setSubscriptionLoading(true);
      const res = await subscriptionApi.getMe();
      const data = res.data?.data || res.data;
      const normalized = Array.isArray(data) ? data[0] : data;
      setCurrentSubscription(normalized || null);
      return normalized || null;
    } catch (err) {
      console.error('Failed to fetch current subscription:', err);
      setCurrentSubscription(null);
      return null;
    } finally {
      if (!silent) setSubscriptionLoading(false);
    }
  };

  const fetchPayments = async (options = {}) => {
    const { silent = false } = options;
    try {
      if (!silent) setPaymentsLoading(true);
      const res = await paymentApi.getMyPayments();
      const data = res.data?.data || res.data;
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setPayments([]);
    } finally {
      if (!silent) setPaymentsLoading(false);
    }
  };

  const stopPollingStatus = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const startPollingStatus = () => {
    if (pollIntervalRef.current) return;
    const now = Date.now();
    if (now - lastPollTriggerRef.current < 30000) return; // avoid spamming
    lastPollTriggerRef.current = now;
    pollAttemptsRef.current = 0;

    pollIntervalRef.current = setInterval(async () => {
      pollAttemptsRef.current += 1;
      const sub = await fetchCurrentSubscription({ silent: true });
      await fetchPayments({ silent: true });
      const status = getStatusLabel(sub?.status);
      if (status === 'Active' || pollAttemptsRef.current >= 10) {
        if (status === 'Active') {
          const currentUser = getUser() || {};
          if (!currentUser.IsPremium) {
            setUser({ ...currentUser, IsPremium: true });
          }
        }
        stopPollingStatus();
      }
    }, 3000);
  };

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
    fetchPayments();
  }, []);

  const activeStatus = normalizeSubscriptionStatus(currentSubscription?.status);
  const autoRenew = getAutoRenewValue(currentSubscription);
  const hasCurrentSubscription = Boolean(currentSubscription);
  let autoRenewText = '—';
  if (autoRenew === true) autoRenewText = 'true';
  if (autoRenew === false) autoRenewText = 'false';
  const canCancelSubscription = (activeStatus === 'Active' || activeStatus === 'Pending') && autoRenew === true;
  let cancelButtonText = 'Đã tắt gia hạn';
  if (canCancelSubscription) cancelButtonText = 'Hủy gói hiện tại';
  if (cancelLoading) cancelButtonText = 'Đang hủy...';
  const currentPlanId = String(currentSubscription?.planId || currentSubscription?.id || '');
  const hasActiveSubscription = activeStatus === 'Active';

  useEffect(() => {
    if (activeStatus === 'Active') {
      const currentUser = getUser() || {};
      if (!currentUser.IsPremium) {
        setUser({ ...currentUser, IsPremium: true });
      }
    }
  }, [activeStatus]);

  useEffect(() => {
    let cancelled = false;

    const verifyPaymentReturn = async () => {
      const searchParams = new URLSearchParams(location.search);
      const cancel = searchParams.get('cancel');
      const orderCodeFromQuery = searchParams.get('orderCode');
      const pendingOrderCode = localStorage.getItem('pendingOrderCode');
      const orderCode = orderCodeFromQuery || pendingOrderCode || '';
      const isSuccessPath = location.pathname === '/payment/success' || location.pathname === '/payments/return';
      const isCancelPath = location.pathname === '/payment/cancel';

      if (cancel === 'true' || isCancelPath) {
        localStorage.removeItem('pendingOrderCode');
        message.warning('Thanh toán đã bị hủy');
        navigate('/customer/subscriptions', { replace: true });
        return;
      }

      if (!orderCode) {
        if (isSuccessPath) {
          message.error('Không tìm thấy mã giao dịch để xác minh thanh toán');
          navigate('/customer/subscriptions', { replace: true });
        }
        return;
      }

      const status = searchParams.get('status') || '';
      const code = searchParams.get('code') || '';

      setIsVerifyingReturn(true);
      try {
        const query = { orderCode, status, code };
        if (cancel) query.cancel = cancel;

        const res = await paymentApi.verifyReturn(query);
        const result = res.data;
        const success = Boolean(result?.success ?? true);

        if (!success) {
          throw new Error(result?.error?.message || result?.message || 'Xác minh thanh toán thất bại');
        }

        const currentUser = getUser() || {};
        setUser({ ...currentUser, IsPremium: true });
        localStorage.removeItem('pendingOrderCode');

        await fetchCurrentSubscription({ silent: true });
        await fetchPayments({ silent: true });
        stopPollingStatus();

        message.success('Thanh toán thành công, Premium đã được kích hoạt');
      } catch (err) {
        console.error('Failed to verify payment return:', err);
        message.error(err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Xác minh thanh toán thất bại, đang thử đồng bộ từ webhook');
        startPollingStatus();
      } finally {
        if (!cancelled) {
          setIsVerifyingReturn(false);
          navigate('/customer/subscriptions', { replace: true });
        }
      }
    };

    verifyPaymentReturn();

    return () => {
      cancelled = true;
    };
  }, [location.search, location.pathname, navigate]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const hasReturnFlag = searchParams.has('orderCode') || searchParams.has('paymentStatus') || searchParams.has('payos');
    const isSuccessPath = location.pathname === '/payment/success' || location.pathname === '/payments/return';

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && activeStatus !== 'Active') {
        startPollingStatus();
      }
    };

    if ((hasReturnFlag || isSuccessPath) && activeStatus !== 'Active') {
      startPollingStatus();
    }

    window.addEventListener('focus', handleVisibility);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
      stopPollingStatus();
    };
  }, [location.search, location.pathname, activeStatus]);

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => toNumber(a.price) - toNumber(b.price));
  }, [plans]);

  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      const status = getStatusLabel(item.status);
      if (filterStatus !== 'all' && status !== filterStatus) return false;

      const time = new Date(item.createdAt || item.paidAt || item.transactionDateTime).getTime();
      if (filterFrom) {
        const fromTs = new Date(filterFrom).getTime();
        if (!Number.isNaN(fromTs) && time < fromTs) return false;
      }
      if (filterTo) {
        const toTs = new Date(filterTo).getTime();
        if (!Number.isNaN(toTs) && time > toTs + 24 * 60 * 60 * 1000) return false;
      }
      return true;
    });
  }, [payments, filterStatus, filterFrom, filterTo]);

  const handleCheckout = async (planId) => {
    if (!planId) return;
    try {
      setCheckoutLoadingId(planId);

      // Preferred flow: POST /subscriptions { planId }
      const res = await subscriptionApi.create({ planId });
      const payload = res.data?.data || res.data || {};
      const checkoutUrl = payload.checkoutUrl || payload.paymentUrl || payload.payment_url;
      const orderCode = payload.orderCode;

      if (!checkoutUrl) {
        throw new Error('Checkout URL not returned');
      }

      if (orderCode) {
        localStorage.setItem('pendingOrderCode', String(orderCode));
      }

      message.success('Đang chuyển tới trang thanh toán');
      globalThis.location.href = checkoutUrl;
      fetchCurrentSubscription();
      fetchPayments();
      startPollingStatus();
    } catch (err) {
      console.error('Create checkout failed, fallback route:', err);
      try {
        const fallbackRes = await subscriptionApi.checkout(planId);
        const fallbackPayload = fallbackRes.data?.data || fallbackRes.data || {};
        const checkoutUrl = fallbackPayload.checkoutUrl || fallbackPayload.paymentUrl || fallbackPayload.payment_url;
        const orderCode = fallbackPayload.orderCode;

        if (!checkoutUrl) throw new Error('Fallback checkout URL not returned');

        if (orderCode) {
          localStorage.setItem('pendingOrderCode', String(orderCode));
        }

        message.success('Đang chuyển tới trang thanh toán');
        globalThis.location.href = checkoutUrl;
        fetchCurrentSubscription();
        fetchPayments();
        startPollingStatus();
      } catch (fallbackErr) {
        console.error('Fallback checkout failed:', fallbackErr);
        message.error(fallbackErr.response?.data?.message || 'Không thể tạo phiên thanh toán');
      }
    } finally {
      setCheckoutLoadingId(null);
    }
  };

  const handleCancelSubscription = async () => {
    const subscriptionId = currentSubscription?.id || currentSubscription?.subscriptionId;
    if (!subscriptionId) {
      message.warning('Không tìm thấy subscription để hủy');
      return;
    }

    if (!canCancelSubscription) {
      message.info(autoRenew === false ? 'Đã tắt gia hạn cho gói hiện tại' : 'Trạng thái hiện tại không thể hủy');
      return;
    }

    const endDate = currentSubscription?.endDate || currentSubscription?.expiresAt;
    const endDateText = formatDate(endDate);

    const confirmed = await new Promise((resolve) => {
      Modal.confirm({
        title: 'Xác nhận hủy subscription',
        content: `Bạn vẫn dùng Premium đến hết ngày ${endDateText}.`,
        okText: 'Xác nhận hủy',
        cancelText: 'Không',
        okButtonProps: { danger: true },
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });

    if (!confirmed) return;

    try {
      setCancelLoading(true);
      await subscriptionApi.cancel(subscriptionId);
      const refreshedSubscription = await fetchCurrentSubscription();
      fetchPayments();
      message.success(getCancelSuccessMessage(refreshedSubscription));
    } catch (err) {
      console.error('Cancel subscription failed:', err);
      message.error(getCancelErrorMessage(err));
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0b0b0b] to-black text-white font-sans pb-24">
      <header className="sticky top-0 z-30 bg-black/85 backdrop-blur-md border-b border-white/5">
        <div className="px-4 py-4 md:max-w-4xl md:mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="p-2 rounded-full bg-neutral-900 text-neutral-400 hover:text-white transition-all active:scale-90"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black">Premium</p>
              <h1 className="text-xl md:text-2xl font-bold">Subscriptions</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-5 md:max-w-4xl md:mx-auto space-y-6">
        {isVerifyingReturn && (
          <section className="p-3 rounded-xl border border-lime-400/30 bg-lime-400/10 text-sm text-lime-200 inline-flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" />
            Đang xác minh kết quả thanh toán...
          </section>
        )}

        <section className="p-4 rounded-2xl border border-lime-400/25 bg-gradient-to-br from-lime-500/12 via-neutral-900 to-neutral-950 shadow-[0_20px_80px_-60px_rgba(190,242,100,0.5)]">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Crown size={18} className="text-lime-300" />
                Premium Features
              </h2>
              <p className="text-sm text-zinc-300">Mở khóa đầy đủ tính năng khi nâng cấp gói.</p>
            </div>
            <span className="px-2 py-1 rounded-full text-[11px] border border-lime-400/30 text-lime-300 bg-lime-500/10">
              Customer Checkout
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-zinc-300">
            <div className="p-2 rounded-lg bg-black/30 border border-white/10">Upload evidence ảnh/video</div>
            <div className="p-2 rounded-lg bg-black/30 border border-white/10">AI routine suggestions</div>
            <div className="p-2 rounded-lg bg-black/30 border border-white/10">Detailed analytics & streak</div>
            <div className="p-2 rounded-lg bg-black/30 border border-white/10">Unlimited public routines</div>
          </div>
        </section>

        <section className="p-4 rounded-2xl bg-[#0f0f0f] border border-white/10 space-y-3 shadow-[0_20px_80px_-70px_rgba(255,255,255,0.25)]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <BadgeCheck size={18} className="text-lime-300" />
              Current Subscription
            </h3>
            {subscriptionLoading && <Loader2 size={16} className="animate-spin text-zinc-500" />}
          </div>

          {hasCurrentSubscription ? (
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 via-black to-black p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">
                  {currentSubscription.planName || currentSubscription.name || 'Subscription'}
                </p>
                <span
                  className={`text-[11px] px-2 py-1 rounded-full border ${STATUS_STYLES[activeStatus] || 'bg-white/10 text-zinc-300 border-white/20'}`}
                >
                  {activeStatus}
                </span>
              </div>
              <div className="text-xs text-zinc-300 grid grid-cols-1 md:grid-cols-3 gap-2">
                <p className="rounded-lg bg-white/5 px-3 py-2 border border-white/10">Giá: {formatCurrency(currentSubscription.price)}</p>
                <p className="rounded-lg bg-white/5 px-3 py-2 border border-white/10">Bắt đầu: {formatDateTime(currentSubscription.startDate || currentSubscription.startedAt)}</p>
                <p className="rounded-lg bg-white/5 px-3 py-2 border border-white/10">Kết thúc: {formatDateTime(currentSubscription.endDate || currentSubscription.expiresAt)}</p>
              </div>
              <div className="text-xs text-zinc-300 grid grid-cols-1 md:grid-cols-3 gap-2">
                <p className="rounded-lg bg-white/5 px-3 py-2 border border-white/10">Status: {activeStatus}</p>
                <p className="rounded-lg bg-white/5 px-3 py-2 border border-white/10">EndDate: {formatDateTime(currentSubscription.endDate || currentSubscription.expiresAt)}</p>
                <p className="rounded-lg bg-white/5 px-3 py-2 border border-white/10">AutoRenew: {autoRenewText}</p>
              </div>

              {activeStatus === 'Active' && autoRenew === false && (
                <p className="mt-2 text-xs rounded-lg border border-amber-400/40 bg-amber-500/10 text-amber-200 px-3 py-2">
                  Gia hạn đã tắt - còn hiệu lực đến {formatDate(currentSubscription.endDate || currentSubscription.expiresAt)}.
                </p>
              )}

              {activeStatus === 'Cancelled' && (
                <p className="mt-2 text-xs rounded-lg border border-zinc-400/30 bg-zinc-500/10 text-zinc-200 px-3 py-2">
                  Đã hủy gói.
                </p>
              )}

              {(activeStatus === 'Active' || activeStatus === 'Pending') && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelLoading || !canCancelSubscription}
                  className="mt-2 px-3 py-2 rounded-lg border border-red-400/40 text-red-300 text-sm hover:bg-red-500/10 transition-all disabled:opacity-60 inline-flex items-center gap-2"
                >
                  <XCircle size={14} />
                  {cancelButtonText}
                </button>
              )}

              {activeStatus === 'Active' && (
                <p className="text-xs text-zinc-400 mt-1">
                  Bạn đang dùng Premium đến {formatDate(currentSubscription.endDate || currentSubscription.expiresAt)}. Hủy sẽ chỉ tắt tự động gia hạn.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Bạn chưa có gói active.</p>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Wallet size={18} className="text-lime-300" />
              Chọn gói Premium
            </h3>
            {plansLoading && <Loader2 size={16} className="animate-spin text-zinc-500" />}
          </div>

          {plansLoading ? (
            <div className="py-10 flex justify-center">
              <Loader2 size={24} className="animate-spin text-lime-300" />
            </div>
          ) : sortedPlans.length === 0 ? (
            <div className="p-4 rounded-2xl bg-[#111] border border-dashed border-white/10 text-sm text-zinc-500">
              Chưa có gói nào khả dụng.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {sortedPlans.map((plan) => {
                const planId = plan.id || plan.planId;
                const isLoading = checkoutLoadingId === planId;
                const isCurrentActivePlan = hasActiveSubscription && String(planId || '') === currentPlanId;
                const checkoutDisabled = isLoading || isCurrentActivePlan;
                let checkoutButtonLabel = 'Thanh toán ngay';
                if (isCurrentActivePlan) checkoutButtonLabel = 'Đang sử dụng';
                return (
                  <div key={planId} className="rounded-2xl p-[1px] bg-gradient-to-b from-lime-400/40 to-white/10 shadow-[0_10px_60px_-50px_rgba(190,242,100,0.6)]">
                    <div className="h-full rounded-2xl bg-[#0f0f0f] p-4 flex flex-col gap-3 border border-white/5">
                      <div>
                        <h4 className="text-base font-bold text-white">{plan.name || 'Premium Plan'}</h4>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{plan.description || 'Gói nâng cấp premium dành cho bạn.'}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-2xl font-black text-lime-300">{formatCurrency(plan.price)}</p>
                        <p className="text-xs text-zinc-400">{toNumber(plan.durationDays, 0)} ngày</p>
                      </div>

                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => navigate(`/customer/subscriptions/${planId}`)}
                          className="w-1/2 rounded-xl border border-white/10 text-zinc-200 font-semibold py-2.5 text-sm hover:bg-white/5 transition-all"
                        >
                          Xem chi tiết
                        </button>
                        <button
                          onClick={() => handleCheckout(planId)}
                          disabled={checkoutDisabled}
                          className="w-1/2 rounded-xl bg-lime-400 text-black font-bold py-2.5 text-sm hover:bg-lime-300 transition-all disabled:opacity-60 inline-flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Đang tạo thanh toán
                            </>
                          ) : (
                            <>
                              {checkoutButtonLabel}
                              <ExternalLink size={14} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="p-4 rounded-2xl bg-[#0f0f0f] border border-white/10 space-y-3 shadow-[0_20px_80px_-70px_rgba(255,255,255,0.25)]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <History size={18} className="text-lime-300" />
              Lịch sử thanh toán
            </h3>
            {paymentsLoading && <Loader2 size={16} className="animate-spin text-zinc-500" />}
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <label className="text-zinc-400">Trạng thái</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
              >
                <option value="all">Tất cả</option>
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Canceled">Canceled</option>
                <option value="Expired">Expired</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-zinc-400">Từ</label>
              <input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
                className="bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-zinc-400">Đến</label>
              <input
                type="date"
                value={filterTo}
                onChange={(e) => setFilterTo(e.target.value)}
                className="bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none"
              />
            </div>
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterFrom('');
                setFilterTo('');
              }}
              className="text-xs px-3 py-2 rounded-lg border border-white/10 text-zinc-300 hover:bg-white/10 transition"
            >
              Xóa bộ lọc
            </button>
          </div>

          {paymentsLoading ? (
            <div className="py-6 flex justify-center">
              <Loader2 size={20} className="animate-spin text-lime-300" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <p className="text-sm text-zinc-500">Chưa có giao dịch nào.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="text-left text-zinc-500 border-b border-white/10 bg-white/5">
                    <th className="py-2 pr-3 font-medium">Mã giao dịch</th>
                    <th className="py-2 pr-3 font-medium">Số tiền</th>
                    <th className="py-2 pr-3 font-medium">Trạng thái</th>
                    <th className="py-2 pr-3 font-medium">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((item) => {
                    const status = getStatusLabel(item.status);
                    return (
                      <tr key={item.id || item.paymentId || item.orderCode} className="border-b border-white/5 text-zinc-300 hover:bg-white/5 transition-colors">
                        <td className="py-2 pr-3">{item.orderCode || item.id || item.paymentId || '—'}</td>
                        <td className="py-2 pr-3">{formatCurrency(item.amount)}</td>
                        <td className="py-2 pr-3">
                          <span className={`text-[11px] px-2 py-1 rounded-full border ${STATUS_STYLES[status] || 'bg-white/10 text-zinc-300 border-white/20'}`}>
                            {status}
                          </span>
                        </td>
                        <td className="py-2 pr-3">{formatDateTime(item.createdAt || item.paidAt || item.transactionDateTime)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <BottomNav activeItem="profile" />
    </div>
  );
}
