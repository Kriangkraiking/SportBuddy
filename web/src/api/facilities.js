import client from './client';

// ➕ เพิ่ม: Facility Management (ฝั่งแอดมินเท่านั้น)
export const listFacilitiesRequest = () => client.get('/facilities').then((r) => r.data);
export const createFacilityRequest = (data) => client.post('/facilities', data).then((r) => r.data);
export const updateFacilityRequest = (id, data) => client.put(`/facilities/${id}`, data).then((r) => r.data);
export const deleteFacilityRequest = (id) => client.delete(`/facilities/${id}`).then((r) => r.data);
