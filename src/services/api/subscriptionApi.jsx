import axiosClient from '../core/axiosClient';

const subscriptionApi = {
  // Subscription Plans
  getPlans: () => axiosClient.get('/api/subscription-plans'),
  createPlan: (data) => axiosClient.post('/api/subscription-plans', data),
  getPlanById: (id) => axiosClient.get(`/api/subscription-plans/${id}`),
  updatePlan: (id, data) => axiosClient.patch(`/api/subscription-plans/${id}`, data),
  deletePlan: (id) => axiosClient.delete(`/api/subscription-plans/${id}`),

  // Subscriptions
  checkout: (planId) => axiosClient.post(`/api/subscriptions/checkout/${planId}`),
  create: (data) => axiosClient.post('/api/subscriptions', data),
  getAll: (params) => axiosClient.get('/api/subscriptions', { params }),
  getMe: () => axiosClient.get('/api/subscriptions/me'),
  cancel: (id) => axiosClient.post(`/api/subscriptions/${id}/cancel`),
};

export default subscriptionApi;
