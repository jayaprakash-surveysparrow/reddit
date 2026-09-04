const redis = require('../db/redis');

async function getVersion(namespace) {
  const value = await redis.get(`version:${namespace}`);
  return value || '0';
}

async function bumpVersion(namespace) {
  await redis.incr(`version:${namespace}`);
}

module.exports = { getVersion, bumpVersion };
