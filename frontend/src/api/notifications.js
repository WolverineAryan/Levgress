import api from './axios';

export const getNotifications = (page = 1, limit = 10) => {
  return api.get(`/notifications?page=${page}&limit=${limit}`);
};

export const markAsRead = (id) => {
  return api.put(`/notifications/${id}/read`);
};

export const markAllAsRead = () => {
  return api.put('/notifications/read-all');
};
