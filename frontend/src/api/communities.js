import { client } from './client';

export const createCommunity = (payload) => client.post('/communities', payload).then((r) => r.data);
export const listCommunities = (params) => client.get('/communities', { params }).then((r) => r.data);
export const getCommunity = (name) => client.get(`/communities/${name}`).then((r) => r.data);
export const updateCommunity = (name, payload) =>
  client.patch(`/communities/${name}`, payload).then((r) => r.data);
export const deleteCommunity = (name) => client.delete(`/communities/${name}`).then((r) => r.data);
export const getCommunityMembers = (name, params) =>
  client.get(`/communities/${name}/members`, { params }).then((r) => r.data);
export const joinCommunity = (name) => client.post(`/communities/${name}/join`).then((r) => r.data);
export const leaveCommunity = (name) => client.delete(`/communities/${name}/leave`).then((r) => r.data);
export const getCommunityPosts = (name, params) =>
  client.get(`/communities/${name}/posts`, { params }).then((r) => r.data);
export const createCommunityPost = (name, payload) =>
  client.post(`/communities/${name}/posts`, payload).then((r) => r.data);
export const autocompleteCommunities = (q, limit = 8) => 
  client.get('/communities/autocomplete', {params: {q, limit} }).then((r) => r.data);