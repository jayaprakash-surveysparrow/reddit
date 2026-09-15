import { client } from './client';

export const updateComment = (id, payload) => client.patch(`/comments/${id}`, payload).then((r) => r.data);
export const deleteComment = (id) => client.delete(`/comments/${id}`).then((r) => r.data);
export const voteComment = (id, value) => client.put(`/comments/${id}/vote`, { value }).then((r) => r.data);
export const removeCommentVote = (id) => client.delete(`/comments/${id}/vote`).then((r) => r.data);
