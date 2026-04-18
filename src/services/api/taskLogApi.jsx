import axiosClient from '../core/axiosClient';

const taskLogApi = {
  getToday: () => axiosClient.get('/api/TaskLogs/today'),
  checkin: (data) => axiosClient.post('/api/TaskLogs/checkin', data),
  logQuantity: (data) => axiosClient.post('/api/TaskLogs/log', data),
  skip: (id) => axiosClient.post(`/api/TaskLogs/${id}/skip`),
  updateEvidence: (id, data) => axiosClient.patch(`/api/TaskLogs/${id}/evidence`, data),
  delete: (id) => axiosClient.delete(`/api/TaskLogs/${id}`),
};

export default taskLogApi;
