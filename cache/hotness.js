const redis = require('../db/redis');
const { DEFAULT_THRESHOLD, DEFAULT_WINDOW_SECONDS } = require('./config');

async function recordHitAndCheckHot(hotnessKey, threshold = DEFAULT_THRESHOLD, windowSeconds = DEFAULT_WINDOW_SECONDS) {
  const key = `hits:${hotnessKey}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }
  return count >= threshold;
}

module.exports = { recordHitAndCheckHot };
