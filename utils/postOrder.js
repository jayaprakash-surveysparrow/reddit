const { Sequelize } = require('sequelize');

// Builds a Sequelize `order` clause so sorting happens in Postgres via
// ORDER BY (and can be paired with LIMIT/OFFSET), instead of fetching every
// matching row into the app and sorting it in JavaScript — the latter doesn't
// scale once a community or feed has more posts than comfortably fit in
// memory. "hot" is computed as a raw SQL expression for the same reason: an
// age-decayed score ranking isn't a plain column, but Postgres can still
// order by it directly without the app ever seeing the unranked rows.
function postOrderClause(sort) {
  if (sort === 'top') {
    return [['score', 'DESC']];
  }
  if (sort === 'hot') {
    return [[Sequelize.literal('"Post"."score" / POWER(EXTRACT(EPOCH FROM (now() - "Post"."created_at")) / 3600 + 2, 1.5)'), 'DESC']];
  }
  return [['created_at', 'DESC']];
}

module.exports = { postOrderClause };
