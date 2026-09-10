const { buildTimeFilter } = require('./timeFilter');

// Maps the UI's "Relevance / Hot / Top / New / Comment count" dropdown onto
// an explicit sort clause. 'relevance' and 'hot' return undefined here on
// purpose — relevance uses OpenSearch's default _score sort, and hot is
// handled separately in buildQuery below since it needs a function_score,
// not a sort clause.
function buildSort(sort, config) {
  if (sort === 'new') return [{ created_at: 'desc' }];
  if (sort === 'top') return [{ [config.scoreField]: 'desc' }];
  if (sort === 'comments' && config.hasCommentCount) return [{ comment_count: 'desc' }];
  return undefined;
}

// Same "hot" formula as utils/postOrder.js uses for Postgres-backed post
// listings (score / (age_in_hours + 2) ^ 1.5), reimplemented as a Painless
// script so OpenSearch can rank by it directly. `now` is passed in as a
// param computed by the app rather than read inside the script, since
// Painless's sandbox doesn't allow arbitrary system-clock access.
function applyHotRanking(query, config) {
  return {
    function_score: {
      query,
      script_score: {
        script: {
          source:
            "double ageHours = (params.now - doc['created_at'].value.toInstant().toEpochMilli()) / 3600000.0; " +
            'return doc[params.scoreField].value / Math.pow(ageHours + 2, 1.5);',
          params: { now: Date.now(), scoreField: config.scoreField },
        },
      },
      boost_mode: 'replace',
    },
  };
}

function buildSearchBody(config, q, sort, time, limit) {
  const filter = [];
  const timeFilter = buildTimeFilter(time);
  if (timeFilter) filter.push(timeFilter);

  let query = {
    bool: {
      must: [{ multi_match: { query: q, fields: config.fields } }],
      filter,
    },
  };

  if (sort === 'hot') {
    query = applyHotRanking(query, config);
  }

  const body = { size: limit, query };

  const sortClause = buildSort(sort, config);
  if (sortClause) body.sort = sortClause;

  return body;
}

module.exports = { buildSearchBody };
