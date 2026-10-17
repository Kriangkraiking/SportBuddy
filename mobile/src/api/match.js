import client from './client';

export const matchRequest = (params) => client.get('/match', { params }).then((r) => r.data);
// ➕ เพิ่ม: ระบบปัดหาคู่กีฬาแบบ Tinder — ดึงรายชื่อผู้เล่นให้ปัด และส่งผลการปัดไปเช็คว่าจับคู่กันหรือยัง
export const getMatchCandidatesRequest = (params) => client.get('/match/candidates', { params }).then((r) => r.data);
export const swipeMatchRequest = (data) => client.post('/match/swipe', data).then((r) => r.data);
