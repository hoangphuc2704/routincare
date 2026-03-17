import axiosClient from '../service/axiosClient';

const categoryApi = {
  // Public
  getAll: (params) => axiosClient.get('/api/Categories', { params }),
  create: (data) => axiosClient.post('/api/Categories', data),
  getById: (id) => axiosClient.get(`/api/Categories/${id}`),
  update: (id, data) => axiosClient.patch(`/api/Categories/${id}`, data),
  delete: (id) => axiosClient.delete(`/api/Categories/${id}`),
};

export default categoryApi;
