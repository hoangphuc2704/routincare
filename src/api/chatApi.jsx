import axiosClient from '../service/axiosClient';

const chatApi = {
  // Conversations
  createDirect: (userId) => axiosClient.post(`/api/chats/direct/${userId}`),
  getConversations: () => axiosClient.get('/api/chats/conversations'),
  getMessages: (conversationId, params) =>
    axiosClient.get(`/api/chats/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, data) =>
    axiosClient.post(`/api/chats/conversations/${conversationId}/messages`, data),
  markAsRead: (conversationId, data) =>
    axiosClient.patch(`/api/chats/conversations/${conversationId}/read`, data),
  deleteMessage: (messageId) => axiosClient.delete(`/api/chats/messages/${messageId}`),
};

export default chatApi;
