import client from './client';

export const listMessagesRequest = (eventId) =>
  client.get(`/events/${eventId}/messages`).then((r) => r.data);

export const sendMessageRequest = (eventId, text) =>
  client.post(`/events/${eventId}/messages`, { text }).then((r) => r.data);
