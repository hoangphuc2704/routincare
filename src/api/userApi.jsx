import axiosClient from '../service/axiosClient';

const userApi = {
  // Danh sách users (admin)
  getAll: (params) => axiosClient.get('/api/Users', { params }),
  // Tạo user (admin)
  create: (data) => axiosClient.post('/api/Users', data),
  // Chi tiết user theo ID
  getById: (id) => axiosClient.get(`/api/Users/${id}`),
  // Profile của mình
  getMe: () => axiosClient.get('/api/Users/me'),
  // Cập nhật profile
  updateMe: (data) => axiosClient.patch('/api/Users/me', data),
  // Đổi mật khẩu
  changePassword: (data) => axiosClient.patch('/api/Users/me/password', data),

  // Follow / Unfollow
  follow: (id) => axiosClient.post(`/api/Users/${id}/follow`),
  unfollow: (id) => axiosClient.delete(`/api/Users/${id}/follow`),
  getFollowers: (id) => axiosClient.get(`/api/Users/${id}/followers`),
  getFollowing: (id) => axiosClient.get(`/api/Users/${id}/following`),

  // Block / Unblock
  block: (id) => axiosClient.post(`/api/Users/${id}/block`),
  unblock: (id) => axiosClient.delete(`/api/Users/${id}/block`),
  getBlocked: () => axiosClient.get('/api/Users/me/blocks'),
};

export default userApi;
