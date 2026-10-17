import client from './client';

export const listEventsRequest = (params) => client.get('/events', { params }).then((r) => r.data);
export const getEventRequest = (id) => client.get(`/events/${id}`).then((r) => r.data);
export const createEventRequest = (data) => client.post('/events', data).then((r) => r.data);
// ✏️ แก้ไข: ตอนนี้ join แค่ส่งคำขอ ต้องรอ host อนุมัติก่อนถึงจะเข้าร่วมจริง (ดู eventController.joinEvent)
export const joinEventRequest = (id) => client.post(`/events/${id}/join`).then((r) => r.data);
// ใช้ตัวเดียวกันได้ทั้งยกเลิกคำขอที่ยังรออนุมัติ และออกจากกิจกรรมที่เข้าร่วมแล้วจริง
export const leaveEventRequest = (id) => client.post(`/events/${id}/leave`).then((r) => r.data);
// ➕ เพิ่ม: host อนุมัติ/ปฏิเสธคำขอเข้าร่วม
export const approveJoinRequestRequest = (id, userId) => client.post(`/events/${id}/approve/${userId}`).then((r) => r.data);
export const declineJoinRequestRequest = (id, userId) => client.post(`/events/${id}/decline/${userId}`).then((r) => r.data);
export const updateEventRequest = (id, data) => client.put(`/events/${id}`, data).then((r) => r.data);
// ➕ เพิ่ม: จบกิจกรรม (host กดเอง) ปลดล็อกให้รีวิวกันได้
export const completeEventRequest = (id) => client.post(`/events/${id}/complete`).then((r) => r.data);
export const deleteEventRequest = (id) => client.delete(`/events/${id}`).then((r) => r.data);
