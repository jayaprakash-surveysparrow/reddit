import { client } from './client';

export const getAuditLogs = (params) => client.get('/audit-logs', { params }).then((r) => r.data);
