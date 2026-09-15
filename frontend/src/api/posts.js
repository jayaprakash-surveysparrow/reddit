import { client } from './client';

export const getPost = (id) => client.get(`/posts/${id}`).then((r) => r.data);
export const updatePost = (id, payload) => client.patch(`/posts/${id}`, payload).then((r) => r.data);
export const deletePost = (id) => client.delete(`/posts/${id}`).then((r) => r.data);
export const votePost = (id, value) => client.put(`/posts/${id}/vote`, { value }).then((r) => r.data);
export const removePostVote = (id) => client.delete(`/posts/${id}/vote`).then((r) => r.data);
export const getPostComments = (id, params) =>
  client.get(`/posts/${id}/comments`, { params }).then((r) => r.data);
export const createPostComment = (id, payload) =>
  client.post(`/posts/${id}/comments`, payload).then((r) => r.data);
