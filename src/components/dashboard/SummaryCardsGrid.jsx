import React from 'react';
import { formatVND, getDarkThemeColors } from '../../utils/revenueChartUtils';
import SkeletonLoader from '../SkeletonLoader';

/**
 * SummaryCard - Individual card component displaying a metric
 */
const SummaryCard = ({ title, value, icon: Icon, trend, loading = false, color = 'blue' }) => {
  if (loading) {
    return <SkeletonLoader type="card" height="h-20" />;
  }

  const colorClasses = {
    blue: 'text-blue-400 bg-blue-900/20 border-blue-700/30',
    green: 'text-green-400 bg-green-900/20 border-green-700/30',
    amber: 'text-amber-400 bg-amber-900/20 border-amber-700/30',
    purple: 'text-purple-400 bg-purple-900/20 border-purple-700/30',
  };

  return (
    <div
      className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/20`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-white mb-2">{value}</p>
          {trend && (
            <div
              className={`flex items-center text-sm font-medium ${
                trend > 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              <span>{trend > 0 ? '↑' : '↓'}</span>
              <span className="ml-1">{Math.abs(trend)}% so với kỳ trước</span>
            </div>
          )}
        </div>

        {Icon && (
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-lg ${colorClasses[color]}`}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * SummaryCardsGrid - Display all summary cards in a responsive grid
 */
const SummaryCardsGrid = ({ data, loading = false }) => {
  // Debug log
  console.log('🎯 SummaryCardsGrid received:', { data, loading });

  const cards = [
    {
      title: 'Tổng doanh thu',
      value: formatVND(data?.totalRevenue || 0),
      icon: () => <span className="text-xl">💰</span>,
      color: 'blue',
    },
    {
      title: 'Giao dịch thành công',
      value: (data?.successfulTransactions || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
      icon: () => <span className="text-xl">✅</span>,
      color: 'green',
    },
    {
      title: 'Doanh thu ròng',
      value: formatVND(data?.netRevenue || 0),
      icon: () => <span className="text-xl">📈</span>,
      color: 'amber',
    },
    {
      title: 'Giao dịch chờ xử lý',
      value: (data?.pendingTransactions || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
      icon: () => <span className="text-xl">⏳</span>,
      color: 'purple',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <SummaryCard
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          trend={card.trend}
          loading={loading}
          color={card.color}
        />
      ))}
    </div>
  );
};

export default SummaryCardsGrid;
