import { client } from './client';

export const getCommunityActivity = (name, params) =>
  client.get(`/admin/communities/${name}/activity`, { params }).then((r) => r.data);
export const getUserActivity = (username, params) =>
  client.get(`/admin/users/${username}/activity`, { params }).then((r) => r.data);
export const getTopActive = (params) => client.get('/admin/top-active', { params }).then((r) => r.data);
