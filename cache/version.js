const redis = require('../db/redis');

async function getVersion(namespace) {
  const value = await redis.get(`version:${namespace}`);
  return value || '0';
}

// Bumping this orphans every cache entry built from the old version number
// at once — they simply stop being looked up and expire away via their own
// TTL — instead of needing to enumerate or SCAN for every page/sort/filter
// permutation that was ever cached under the old data.
async function bumpVersion(namespace) {
  await redis.incr(`version:${namespace}`);
}

module.exports = { getVersion, bumpVersion };
