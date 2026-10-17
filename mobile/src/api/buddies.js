import client from './client';

export const searchBuddiesRequest = (params) =>
  client.get('/buddies/search', { params }).then((r) => r.data);

export const sendBuddyRequest = (data) => client.post('/buddies/request', data).then((r) => r.data);

export const respondBuddyRequest = (id, status) =>
  client.put(`/buddies/request/${id}`, { status }).then((r) => r.data);

export const listBuddyRequests = () => client.get('/buddies/requests').then((r) => r.data);

export const listFriendsRequest = () => client.get('/buddies/friends').then((r) => r.data);
export const findByUidRequest = (uid) => client.get(`/buddies/uid/${uid}`).then((r) => r.data);
