import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Crown, ExternalLink, Loader2, Wallet } from 'lucide-react';
import { message } from 'antd';
import subscriptionApi from '../../../services/api/subscriptionApi';
import BottomNav from '../../../components/BottomNav';

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const formatCurrency = (value) => {
  const amount = toNumber(value, 0);
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
};

export default function PlanDetailPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fetchPlan = useCallback(async () => {
    try {
      setLoading(true);
      const res = await subscriptionApi.getPlanById(planId);
      const data = res.data?.data || res.data;
      setPlan(data || null);
    } catch (err) {
      console.error('Failed to fetch plan detail:', err);
      message.error('Không tải được thông tin gói');
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    if (planId) fetchPlan();
  }, [planId, fetchPlan]);

  const handleCheckout = async () => {
    if (!planId) return;
    try {
      setCheckoutLoading(true);
      const res = await subscriptionApi.create({ planId });
      const payload = res.data?.data || res.data || {};
      const checkoutUrl = payload.checkoutUrl || payload.paymentUrl || payload.payment_url;
      const orderCode = payload.orderCode;
      if (!checkoutUrl) throw new Error('Checkout URL not returned');

      if (orderCode) {
        localStorage.setItem('pendingOrderCode', String(orderCode));
      }

      message.success('Đang chuyển tới trang thanh toán');
      globalThis.location.href = checkoutUrl;
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
      } catch (fallbackErr) {
        console.error('Fallback checkout failed:', fallbackErr);
        message.error(fallbackErr.response?.data?.message || 'Không thể tạo phiên thanh toán');
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  const features = plan?.features || [
    'Upload evidence ảnh/video',
    'AI routine suggestions',
    'Detailed analytics & streak',
    'Unlimited public routines',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0b0b0b] to-black text-white pb-24">
      <header className="sticky top-0 z-30 bg-black/85 backdrop-blur-md border-b border-white/5">
        <div className="px-4 py-4 md:max-w-4xl md:mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/customer/subscriptions"
              className="p-2 rounded-full bg-neutral-900 text-neutral-400 hover:text-white transition-all active:scale-90"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black">Premium</p>
              <h1 className="text-xl md:text-2xl font-bold">Plan Detail</h1>
            </div>
          </div>
          <button
            onClick={() => navigate('/customer/subscriptions')}
            className="hidden md:inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-white/10 text-zinc-300 hover:bg-white/5"
          >
            Quay lại danh sách
          </button>
        </div>
      </header>

      <main className="px-4 py-6 md:max-w-4xl md:mx-auto space-y-6">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 size={28} className="animate-spin text-lime-300" />
          </div>
        ) : !plan ? (
          <div className="p-4 rounded-2xl bg-[#111] border border-white/10 text-sm text-zinc-400">
            Không tìm thấy gói.
          </div>
        ) : (
          <div className="p-4 rounded-2xl border border-lime-400/25 bg-gradient-to-br from-lime-500/12 via-neutral-900 to-neutral-950 space-y-4 shadow-[0_20px_80px_-60px_rgba(190,242,100,0.45)]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Crown size={18} className="text-lime-300" />
                  {plan.name || 'Premium Plan'}
                </h2>
                <p className="text-sm text-zinc-300">{plan.description || 'Gói nâng cấp premium dành cho bạn.'}</p>
              </div>
              <span className="px-2 py-1 rounded-full text-[11px] border border-lime-400/30 text-lime-300 bg-lime-500/10">
                {toNumber(plan.durationDays, 0)} ngày
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-lime-300">{formatCurrency(plan.price)}</p>
              <span className="text-sm text-zinc-400">/ gói</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-zinc-200">
              {features.map((item, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-black/30 border border-white/10">{item}</div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-zinc-300">
              <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                <p className="text-xs text-zinc-500 mb-1">Giá</p>
                <p className="font-semibold">{formatCurrency(plan.price)}</p>
              </div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                <p className="text-xs text-zinc-500 mb-1">Thời lượng</p>
                <p className="font-semibold">{toNumber(plan.durationDays, 0)} ngày</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full md:w-auto rounded-xl bg-lime-400 text-black font-bold px-6 py-3 text-sm hover:bg-lime-300 transition-all disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Đang tạo thanh toán
                  </>
                ) : (
                  <>
                    Thanh toán ngay
                    <ExternalLink size={16} />
                  </>
                )}
              </button>
              <button
                onClick={() => navigate('/customer/subscriptions')}
                className="w-full md:w-auto rounded-xl border border-white/10 text-zinc-200 font-semibold px-6 py-3 text-sm hover:bg-white/5 transition-all inline-flex items-center justify-center gap-2"
              >
                <Wallet size={16} />
                Xem các gói khác
              </button>
            </div>
          </div>
        )}
      </main>

      <BottomNav activeItem="profile" />
    </div>
  );
}
