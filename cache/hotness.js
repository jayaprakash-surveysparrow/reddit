const redis = require('../db/redis');
const { DEFAULT_THRESHOLD, DEFAULT_WINDOW_SECONDS } = require('./config');

// Fixed-window counter: INCR a per-key counter, giving it a TTL equal to the
// window the first time it's created. This is a coarse approximation of a
// sliding window (a burst right at the window boundary can be undercounted),
// but that's fine here — this is deciding "is this worth caching," not
// acting as a strict rate limiter, where a true sliding window (a sorted set
// per key) would be worth the extra cost.
async function recordHitAndCheckHot(hotnessKey, threshold = DEFAULT_THRESHOLD, windowSeconds = DEFAULT_WINDOW_SECONDS) {
  const key = `hits:${hotnessKey}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }
  return count >= threshold;
}

module.exports = { recordHitAndCheckHot };
