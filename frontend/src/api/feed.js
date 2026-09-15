import { client } from './client';

export const getFeed = (params) => client.get('/feed', { params }).then((r) => r.data);
