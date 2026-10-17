import client from './client';

export const registerRequest = (data) => client.post('/auth/register', data).then((r) => r.data);
export const loginRequest = (data) => client.post('/auth/login', data).then((r) => r.data);
export const meRequest = () => client.get('/auth/me').then((r) => r.data);
export const updateProfileRequest = (data) => client.put('/users/me', data).then((r) => r.data);
// ➕ เพิ่ม: ดูโปรไฟล์สาธารณะของ user คนอื่น (เช่น host เช็คฝีมือ/กีฬาของคนที่ขอเข้าร่วมกิจกรรม)
export const getUserByIdRequest = (userId) => client.get(`/users/${userId}`).then((r) => r.data);

// `image` is { uri, name, type } — the shape returned by expo-image-picker,
// wrapped into FormData for a multipart upload.
export const uploadAvatarRequest = (image) => {
  const formData = new FormData();
  formData.append('avatar', {
    uri: image.uri,
    name: image.name || 'avatar.jpg',
    type: image.type || 'image/jpeg',
  });

  return client
    .post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

// ➕ เพิ่ม: ระบบบล็อกผู้เล่นส่วนตัว (host บล็อกผู้เล่นที่มีพฤติกรรมไม่เหมาะสม)
export const blockUserRequest = (userId) => client.post(`/users/${userId}/block`).then((r) => r.data);
export const unblockUserRequest = (userId) => client.delete(`/users/${userId}/block`).then((r) => r.data);
export const listBlockedUsersRequest = () => client.get('/users/me/blocked').then((r) => r.data);
