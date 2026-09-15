import { client } from './client';

export const getMe = () => client.get('/users/me').then((r) => r.data);
export const updateMe = (payload) => client.patch('/users/me', payload).then((r) => r.data);
export const getUserProfile = (username) => client.get(`/users/${username}`).then((r) => r.data);
export const getUserPosts = (username, params) =>
  client.get(`/users/${username}/posts`, { params }).then((r) => r.data);
export const getUserComments = (username, params) =>
  client.get(`/users/${username}/comments`, { params }).then((r) => r.data);
