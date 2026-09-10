const {checkLimit} = require('./limiter');
const {limiters} = require('./config');
const logger = require('../utils/logger');

function rateLimit(limiterName) {
    const config = limiters[limiterName];
    if(!config) throw new Error(`No rate limit config registered for "${limiterName}"`);
    
    return async function rateLimitMiddleware(req, res, next) {
        try {
            const key = config.keyGenerator(req);
            const {allowed, remaining, resetSeconds} = await checkLimit(key, config.windowSeconds, config.maxRequests);

            res.set('RateLimit-Limit', config.maxRequests);
            res.set('RateLimit-Remaining', remaining);
            res.set('RateLimit-Reset', resetSeconds);

            if(!allowed) {
                res.set('Retry-After', resetSeconds);
                return res.status(429).json({error: 'Too many requests, please try again later'});
            }

            next();
        } catch(err) {
            logger.error('Rate limit middleware error', {error: err.message});
            next();
        }
    };
}

module.exports = {rateLimit};