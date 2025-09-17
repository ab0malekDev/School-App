const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Session, User } = require('../models');

// Create a new session
router.post('/sessions', async (req, res) => {
  try {
    const { userId, userRole, username } = req.body;
    if (!userId || !userRole || !username) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // Remove old sessions for this user
    await Session.destroy({ where: { userId } });
    // Generate a unique session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    const session = await Session.create({
      token: sessionToken,
      userId,
      userRole,
      username,
      createdAt: now,
      expiresAt,
      isActive: true
    });
    res.status(201).json({
      token: sessionToken,
      user: {
        id: userId,
        username,
        role: userRole
      },
      expiresAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Validate session
router.get('/sessions/validate', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
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
    res.json({
      valid: true,
      user: {
        id: session.userId,
        username: session.username,
        role: session.userRole
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete session (logout)
router.delete('/sessions', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }
    const session = await Session.findOne({ where: { token } });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    session.isActive = false;
    await session.save();
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Clean up expired sessions (can be called periodically)
router.post('/sessions/cleanup', async (req, res) => {
  try {
    const now = new Date();
    await Session.destroy({
      where: {
        [Session.sequelize.Op.or]: [
          { expiresAt: { [Session.sequelize.Op.lt]: now } },
          { isActive: false }
        ]
      }
    });
    res.json({ message: 'Expired sessions cleaned up' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 