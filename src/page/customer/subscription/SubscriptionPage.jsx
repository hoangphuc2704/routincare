import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Crown, ExternalLink, History, Loader2, Wallet, XCircle } from 'lucide-react';
import { message } from 'antd';
import BottomNav from '../../../components/BottomNav';
import subscriptionApi from '../../../api/subscriptionApi';
import paymentApi from '../../../api/paymentApi';

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

export default function SubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

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

  const fetchCurrentSubscription = async () => {
    try {
      setSubscriptionLoading(true);
      const res = await subscriptionApi.getMe();
      const data = res.data?.data || res.data;
      const normalized = Array.isArray(data) ? data[0] : data;
      setCurrentSubscription(normalized || null);
    } catch (err) {
      console.error('Failed to fetch current subscription:', err);
      setCurrentSubscription(null);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setPaymentsLoading(true);
      const res = await paymentApi.getMyPayments();
      const data = res.data?.data || res.data;
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
    fetchPayments();
  }, []);

  const activeStatus = getStatusLabel(currentSubscription?.status);

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => toNumber(a.price) - toNumber(b.price));
  }, [plans]);

  const handleCheckout = async (planId) => {
    if (!planId) return;
    try {
      setCheckoutLoadingId(planId);

      // Preferred flow: POST /subscriptions { planId }
      const res = await subscriptionApi.create({ planId });
      const payload = res.data?.data || res.data || {};
      const checkoutUrl = payload.checkoutUrl || payload.paymentUrl || payload.payment_url;

      if (!checkoutUrl) {
        throw new Error('Checkout URL not returned');
      }

      message.success('Đang chuyển tới trang thanh toán');
      window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      fetchCurrentSubscription();
      fetchPayments();
    } catch (err) {
      console.error('Create checkout failed, fallback route:', err);
      try {
        const fallbackRes = await subscriptionApi.checkout(planId);
        const fallbackPayload = fallbackRes.data?.data || fallbackRes.data || {};
        const checkoutUrl = fallbackPayload.checkoutUrl || fallbackPayload.paymentUrl || fallbackPayload.payment_url;

        if (!checkoutUrl) throw new Error('Fallback checkout URL not returned');

        message.success('Đang chuyển tới trang thanh toán');
        window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
        fetchCurrentSubscription();
        fetchPayments();
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

    if (!window.confirm('Bạn chắc chắn muốn hủy gói hiện tại?')) return;

    try {
      setCancelLoading(true);
      await subscriptionApi.cancel(subscriptionId);
      message.success('Đã gửi yêu cầu hủy gói');
      fetchCurrentSubscription();
      fetchPayments();
    } catch (err) {
      console.error('Cancel subscription failed:', err);
      message.error(err.response?.data?.message || 'Không thể hủy subscription');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24">
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
        <section className="p-4 rounded-2xl border border-lime-400/25 bg-gradient-to-br from-lime-500/12 via-neutral-900 to-neutral-950">
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

        <section className="p-4 rounded-2xl bg-[#111] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <BadgeCheck size={18} className="text-lime-300" />
              Current Subscription
            </h3>
            {subscriptionLoading && <Loader2 size={16} className="animate-spin text-zinc-500" />}
          </div>

          {!currentSubscription ? (
            <p className="text-sm text-zinc-500">Bạn chưa có gói active.</p>
          ) : (
            <div className="rounded-xl border border-white/10 bg-black/30 p-3 space-y-2">
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
              <div className="text-xs text-zinc-400 grid grid-cols-1 md:grid-cols-2 gap-1">
                <p>Giá: {formatCurrency(currentSubscription.price)}</p>
                <p>Bắt đầu: {formatDateTime(currentSubscription.startDate || currentSubscription.startedAt)}</p>
                <p>Kết thúc: {formatDateTime(currentSubscription.endDate || currentSubscription.expiresAt)}</p>
                <p>Mã: {currentSubscription.id || currentSubscription.subscriptionId || '—'}</p>
              </div>
              {activeStatus === 'Active' && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelLoading}
                  className="mt-2 px-3 py-2 rounded-lg border border-red-400/40 text-red-300 text-sm hover:bg-red-500/10 transition-all disabled:opacity-60 inline-flex items-center gap-2"
                >
                  <XCircle size={14} />
                  {cancelLoading ? 'Đang hủy...' : 'Hủy gói hiện tại'}
                </button>
              )}
            </div>
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
                return (
                  <div key={planId} className="rounded-2xl p-[1px] bg-gradient-to-b from-lime-400/40 to-white/5">
                    <div className="h-full rounded-2xl bg-[#111] p-4 flex flex-col gap-3">
                      <div>
                        <h4 className="text-base font-bold text-white">{plan.name || 'Premium Plan'}</h4>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{plan.description || 'Gói nâng cấp premium dành cho bạn.'}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-2xl font-black text-lime-300">{formatCurrency(plan.price)}</p>
                        <p className="text-xs text-zinc-400">{toNumber(plan.durationDays, 0)} ngày</p>
                      </div>

                      <button
                        onClick={() => handleCheckout(planId)}
                        disabled={isLoading}
                        className="mt-auto w-full rounded-xl bg-lime-400 text-black font-bold py-2.5 text-sm hover:bg-lime-300 transition-all disabled:opacity-60 inline-flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Đang tạo thanh toán
                          </>
                        ) : (
                          <>
                            Thanh toán ngay
                            <ExternalLink size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="p-4 rounded-2xl bg-[#111] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <History size={18} className="text-lime-300" />
              Lịch sử thanh toán
            </h3>
            {paymentsLoading && <Loader2 size={16} className="animate-spin text-zinc-500" />}
          </div>

          {paymentsLoading ? (
            <div className="py-6 flex justify-center">
              <Loader2 size={20} className="animate-spin text-lime-300" />
            </div>
          ) : payments.length === 0 ? (
            <p className="text-sm text-zinc-500">Chưa có giao dịch nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="text-left text-zinc-500 border-b border-white/10">
                    <th className="py-2 pr-3 font-medium">Mã giao dịch</th>
                    <th className="py-2 pr-3 font-medium">Số tiền</th>
                    <th className="py-2 pr-3 font-medium">Trạng thái</th>
                    <th className="py-2 pr-3 font-medium">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((item) => {
                    const status = getStatusLabel(item.status);
                    return (
                      <tr key={item.id || item.paymentId || item.orderCode} className="border-b border-white/5 text-zinc-300">
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
