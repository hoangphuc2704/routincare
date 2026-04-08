import axiosClient from '../service/axiosClient';

const paymentApi = {
  getMyPayments: () => axiosClient.get('/api/payments/me'),
  getAll: (params) => axiosClient.get('/api/payments', { params }),
  verifyReturn: (params) => axiosClient.get('/api/payments/return', { params }),
};

export default paymentApi;
