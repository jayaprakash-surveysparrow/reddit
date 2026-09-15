import { client } from './client';

export const search = (params) => client.get('/search', { params }).then((r) => r.data);
