import axiosClient from '../service/axiosClient';

const paymentApi = {
  getMyPayments: () => axiosClient.get('/api/payments/me'),
  getAll: (params) => axiosClient.get('/api/payments', { params }),
  verifyReturn: (params) => axiosClient.get('/api/payments/return', { params }),

  // Revenue Summary
  getRevenueSummary: (params) => axiosClient.get('/api/payments/revenue/summary', { params }),

  // Revenue by Month
  getRevenueByMonth: (params) => axiosClient.get('/api/payments/revenue/by-month', { params }),

  // Revenue by Plan
  getRevenueByPlan: (params) => axiosClient.get('/api/payments/revenue/by-plan', { params }),

  // Top Plans
  getTopPlans: (params) => axiosClient.get('/api/payments/revenue/top-plans', { params }),
};

export default paymentApi;
