export const TIME_OPTIONS = [
  { value: 'hour', label: 'Past hour' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Past week' },
  { value: 'month', label: 'Past month' },
  { value: 'year', label: 'Past year' },
  { value: 'all', label: 'All time' },
];

export const ACTIVITY_TYPES = [
  { key: 'post_created', short: 'posts' },
  { key: 'comment_created', short: 'comments' },
  { key: 'vote_cast', short: 'votes' },
];

export const TOP_ACTIVE_LIMIT = 5;

// The values db/auditHooks.js writes to audit_logs.entity_type (Sequelize model
// names), which the backend also validates the entityType filter against.
export const AUDIT_ENTITY_TYPES = [
  'User',
  'Community',
  'CommunityMember',
  'Post',
  'Comment',
  'PostVote',
  'CommentVote',
];

export const AUDIT_PAGE_LIMIT = 25;

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
