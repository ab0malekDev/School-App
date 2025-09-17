const { Session } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No authentication token found' });
    }
    const session = await Session.findOne({ where: { token, isActive: true } });
    if (!session) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }
    if (new Date() > new Date(session.expiresAt)) {
      session.isActive = false;
      await session.save();
      return res.status(401).json({ message: 'Session expired' });
    }
    req.user = {
      id: session.userId,
      username: session.username,
      role: session.userRole
    };
    next();
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = auth; 