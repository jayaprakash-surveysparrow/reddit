// Maps the UI's "All time / Past year / Past month / Past week / Today /
// Past hour" dropdown onto an OpenSearch date-math range filter. `null` means
// no filter at all (all time). Shared between full-text search (queryBuilder)
// and the admin analytics aggregations (analytics/queries) — both filter the
// same way on a document's `created_at`.
function buildTimeFilter(time) {
  const rangeMap = {
    hour: 'now-1h',
    today: 'now/d',
    week: 'now-7d',
    month: 'now-30d',
    year: 'now-365d',
  };
  const gte = rangeMap[time];
  if (!gte) return null;
  return { range: { created_at: { gte } } };
}

module.exports = { buildTimeFilter };
