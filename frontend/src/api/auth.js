import { client } from './client';

export const signup = (payload) => client.post('/auth/signup', payload).then((r) => r.data);
export const login = (payload) => client.post('/auth/login', payload).then((r) => r.data);
export const logout = (payload) => client.post('/auth/logout', payload).then((r) => r.data);
export const forgotPassword = (payload) => client.post('/auth/forgot-password', payload).then((r) => r.data);
export const resetPassword = (payload) => client.post('/auth/reset-password', payload).then((r) => r.data);
