import client from './client';

// ➕ เพิ่ม: ระบบรีวิวหลังกิจกรรมจบ
export const createReviewRequest = (eventId, data) => client.post(`/events/${eventId}/reviews`, data).then((r) => r.data);
export const listEventReviewsRequest = (eventId) => client.get(`/events/${eventId}/reviews`).then((r) => r.data);
export const listUserReviewsRequest = (userId) => client.get(`/users/${userId}/reviews`).then((r) => r.data);
