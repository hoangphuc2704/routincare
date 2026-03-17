import axiosClient from '../service/axiosClient';

const friendApi = {
  // Friend requests
  sendRequest: (userId) => axiosClient.post(`/api/friends/requests/${userId}`),
  getIncoming: () => axiosClient.get('/api/friends/requests/incoming'),
  getOutgoing: () => axiosClient.get('/api/friends/requests/outgoing'),
  acceptRequest: (id) => axiosClient.post(`/api/friends/requests/${id}/accept`),
  rejectRequest: (id) => axiosClient.post(`/api/friends/requests/${id}/reject`),
  cancelRequest: (id) => axiosClient.delete(`/api/friends/requests/${id}`),

  // Friends list
  getAll: () => axiosClient.get('/api/friends'),
  unfriend: (userId) => axiosClient.delete(`/api/friends/${userId}`),
};

export default friendApi;
