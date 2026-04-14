/**
 * Mock Revenue Data for Development & Testing
 * Use this to test the Revenue Dashboard when API is not available
 */

export const mockSummaryData = {
  totalRevenue: 5234000,
  totalTransactions: 1250,
  todayRevenue: 125000,
  monthlyRevenue: 450000,
  revenueTrend: 12,
  transactionTrend: 8,
  todayTrend: -5,
  monthlyTrend: 15,
};

export const mockRevenueByMonth = [
  { month: '2025-11', amount: 100000 },
  { month: '2025-12', amount: 150000 },
  { month: '2026-01', amount: 120000 },
  { month: '2026-02', amount: 180000 },
  { month: '2026-03', amount: 220000 },
  { month: '2026-04', amount: 280000 },
];

export const mockRevenueByPlan = [
  { planName: 'Free', revenue: 50000 },
  { planName: 'Basic', revenue: 300000 },
  { planName: 'Pro', revenue: 500000 },
  { planName: 'Enterprise', revenue: 700000 },
  { planName: 'Premium', revenue: 600000 },
];

export const mockTopPlans = [
  { planName: 'Enterprise', revenue: 700000 },
  { planName: 'Premium', revenue: 600000 },
  { planName: 'Pro', revenue: 500000 },
  { planName: 'Basic', revenue: 300000 },
];

/**
 * Mock API response for testing
 */
export const getMockRevenueSummary = () => ({
  data: mockSummaryData,
});

export const getMockRevenueByMonth = () => ({
  data: mockRevenueByMonth,
});

export const getMockRevenueByPlan = () => ({
  data: mockRevenueByPlan,
});

export const getMockTopPlans = () => ({
  data: mockTopPlans,
});
