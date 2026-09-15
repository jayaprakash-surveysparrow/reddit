const { verifyAccessToken } = require('../utils/jwt');
const { findUserById } = require('../repositories/user');
const { toPublicUser } = require('../utils/serializers');
const { runWithActor } = require('../db/auditContext');
const logger = require('../utils/logger');

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header with Bearer token is required' });
  }

  const token = authHeader.slice('Bearer '.length);

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err){
    return res.status(401).json({ error: err.message });
  }

  try {
    const user = await findUserById(payload.sub);
    if (!user) return res.status(401).json({ error: 'User no longer exists' });

    req.user = toPublicUser(user);
    runWithActor(user.id, next);
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = requireAuth;
