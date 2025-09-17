const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { loginLimiter } = require('../middleware/rateLimiter');
const { User, Session } = require('../models');

// تسجيل الدخول
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    // البحث عن المستخدم في قاعدة البيانات
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    // التحقق من كلمة المرور
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    // حذف الجلسات القديمة لهذا المستخدم
    await Session.destroy({ where: { userId: user.id } });
    // إنشاء جلسة جديدة
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 ساعة
    await Session.create({
      token: sessionToken,
      userId: user.id,
      userRole: user.role,
      username: user.username,
      createdAt: now,
      expiresAt,
      isActive: true
    });
    res.status(200).json({
      token: sessionToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      },
      expiresAt
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 