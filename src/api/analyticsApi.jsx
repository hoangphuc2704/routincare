import axiosClient from '../service/axiosClient';

const analyticsApi = {
  getOverview: () => axiosClient.get('/api/analytics/me/overview'),
  getStreaks: () => axiosClient.get('/api/analytics/me/streaks'),
  getHeatmap: () => axiosClient.get('/api/analytics/me/heatmap'),
  getRoutines: () => axiosClient.get('/api/analytics/me/routines'),
  getRoutineById: (id) => axiosClient.get(`/api/analytics/me/routines/${id}`),
  getTasks: () => axiosClient.get('/api/analytics/me/tasks'),
  getProgressChart: () => axiosClient.get('/api/analytics/me/progress-chart'),
};

export default analyticsApi;
