import api from './client';

export async function getNotifications(params = {}) {
  const { data } = await api.get('/notifications', { params });
  return data.data;
}

export async function markNotificationRead(id) {
  const { data } = await api.post(`/notifications/${id}/lu`);
  return data.data;
}

export async function markAllNotificationsRead() {
  const { data } = await api.post('/notifications/tout-lire');
  return data.data;
}
