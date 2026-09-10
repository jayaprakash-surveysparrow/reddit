require('dotenv').config();

const limiters = {
    global: {
        windowSeconds: parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS, 10) || 60,
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
        keyGenerator: (req) => `ip:${req.ip}`,
    },

    auth: {
        windowSeconds: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_SECONDS, 10) || 900,
        maxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS, 10) || 10,
        keyGenerator: (req) => `ip:${req.ip}:${req.path}`,
    },

    write: {
        windowSeconds: 60,
        maxRequests: 20,
        keyGenerator: (req) => `user:${req.user.id}`,
    },
};

module.exports = {limiters};