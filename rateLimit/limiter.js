const redis = require('../db/redis');

async function checkLimit(key, windowSeconds, maxRequests) {
    const redisKey = `ratelimit:${key}`;
    const count = await redis.incr(redisKey);

    if(count === 1) {
        await redis.expire(redisKey, windowSeconds);
    }

    const ttl = await redis.ttl(redisKey);

    return {
        allowed: count <= maxRequests,
        remaining: Math.max(maxRequests - count, 0),
        resetSeconds: ttl > 0 ? ttl : windowSeconds,
    };
}

module.exports = {checkLimit};