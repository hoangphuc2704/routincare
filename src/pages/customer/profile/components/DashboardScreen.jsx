import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Flame, Target, Trophy, Crown } from 'lucide-react';
import Heatmap from '../../../../components/Heatmap';

const StatCard = ({ title, value, icon, sub }) => (
  <div className="p-4 bg-neutral-900 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
    <div className="flex justify-between items-start mb-2">
      <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{title}</span>
      {icon}
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold text-white">{value}</span>
      <span className="text-[10px] text-neutral-500 font-medium">{sub}</span>
    </div>
  </div>
);

export default function DashboardScreen({
  analyticsStats,
  subscriptionLoading,
  subscriptionPlanName,
  subscriptionDescription,
  isPremiumActive,
  heatmapData,
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Thói quen"
          value={analyticsStats.totalRoutines}
          icon={<Target className="text-blue-400" size={24} />}
          sub="Đang chạy"
        />
        <StatCard
          title="Chuỗi"
          value={analyticsStats.currentStreak}
          icon={<Flame className="text-orange-500" size={24} />}
          sub="Ngày"
        />
        <StatCard
          title="Hoàn thành"
          value={`${analyticsStats.completionPercent}%`}
          icon={<Activity className="text-lime-400" size={24} />}
          sub="Tỷ lệ"
        />
        <StatCard
          title="Chuỗi tốt nhất"
          value={analyticsStats.longestStreak}
          icon={<Trophy className="text-yellow-400" size={24} />}
          sub="Kỷ lục"
        />
      </div>

      <div className="p-4 bg-gradient-to-r from-zinc-900 to-black rounded-2xl border border-lime-400/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-lime-400/10 rounded-xl flex items-center justify-center">
            <Crown className="text-lime-400" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-sm">
              {subscriptionLoading ? 'Đang tải...' : subscriptionPlanName}
            </h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-tighter">
              {subscriptionDescription}
            </p>
          </div>
        </div>
        <Link
          to="/customer/subscriptions"
          className="px-4 py-2 bg-lime-400 text-black text-xs font-bold rounded-lg hover:bg-lime-500 transition-all"
        >
          {isPremiumActive ? 'QUẢN LÝ GÓI' : 'NÂNG CẤP CAO CẤP'}
        </Link>
      </div>

      <div className="p-6 bg-neutral-900 rounded-2xl border border-white/5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold flex items-center gap-2">
            <Activity size={20} className="text-lime-400" />
            Nhật ký hoạt động
          </h3>
          <span className="text-xs text-neutral-500">12 tháng gần nhất</span>
        </div>
        <Heatmap data={heatmapData} />
      </div>
    </div>
  );
}
