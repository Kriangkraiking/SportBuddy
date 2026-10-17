import client from './client';

export const listNotificationsRequest = () => client.get('/notifications').then((r) => r.data);
export const markNotificationReadRequest = (id) => client.put(`/notifications/${id}/read`).then((r) => r.data);
export const markAllNotificationsReadRequest = () => client.put('/notifications/read-all').then((r) => r.data);
