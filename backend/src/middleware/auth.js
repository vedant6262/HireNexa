const { createClerkClient, verifyToken } = require('@clerk/backend');

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const allowLocalDevAuth = () => {
  const nodeEnv = (process.env.NODE_ENV || '').toLowerCase();
  return nodeEnv !== 'production' || process.env.ALLOW_DEV_AUTH === 'true';
};

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const devUserId = req.headers['x-dev-user-id'] || req.headers['x-user-id'];

    if (allowLocalDevAuth() && devUserId) {
      req.userId = String(devUserId);
      return next();
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
    req.userId = payload.sub;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
      req.userId = payload.sub;
    }
  } catch (error) {
    // Silent fail for optional auth
  }
  next();
};

const requireRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const devUserId = req.headers['x-dev-user-id'] || req.headers['x-user-id'];
      if (allowLocalDevAuth() && devUserId) {
        const localUser = await require('../config/prisma').user.findUnique({ where: { clerkId: req.userId }, select: { role: true } });
        if (localUser && roles.includes(localUser.role)) return next();
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      const user = await clerkClient.users.getUser(req.userId);
      const dbUser = await require('../config/prisma').user.findUnique({ where: { clerkId: req.userId }, select: { role: true } });
      const role = String(dbUser?.role || user.publicMetadata?.role || '').toUpperCase();
      
      if (!roles.includes(role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      next();
    } catch (error) {
      return res.status(403).json({ error: 'Unable to verify role' });
    }
  };
};

module.exports = { clerkClient, requireAuth, optionalAuth, requireRole };
