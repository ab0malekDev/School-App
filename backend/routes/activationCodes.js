const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const auth = require('../middleware/auth');
const { ActivationCode, Device, User } = require('../models');

// Generate secure activation code
const generateActivationCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Clean up expired codes (run this periodically)
const cleanupExpiredCodes = async () => {
  const now = new Date();
  // Unused codes expire after 1 day, used codes kept for 1 year
  await ActivationCode.destroy({
    where: {
      isUsed: false,
      createdAt: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
    }
  });
  await ActivationCode.destroy({
    where: {
      isUsed: true,
      activatedAt: { $lt: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) }
    }
  });
};
setInterval(cleanupExpiredCodes, 60 * 60 * 1000);

// GET /api/activation-codes - Get all activation codes (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const codes = await ActivationCode.findAll();
    res.json(codes);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching activation codes' });
  }
});

// POST /api/activation-codes - Create new activation code (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { deviceUUID, section } = req.body;
    if (!deviceUUID || !section) {
      return res.status(400).json({ message: 'Device UUID and section are required' });
    }
    if (!['scientific', 'literary', 'intensive'].includes(section)) {
      return res.status(400).json({ message: 'Invalid section. Must be scientific, literary, or intensive' });
    }
    // Check if device already has an unused code
    const existingCode = await ActivationCode.findOne({ where: { deviceId: deviceUUID, isUsed: false } });
    if (existingCode) {
      return res.status(400).json({ message: 'Device already has an unused activation code', existingCode: existingCode.code });
    }
    // Generate unique code
    let code;
    let attempts = 0;
    do {
      code = generateActivationCode();
      attempts++;
      if (attempts > 100) {
        return res.status(500).json({ message: 'Failed to generate unique code' });
      }
    } while (await ActivationCode.findOne({ where: { code } }));
    const newCode = await ActivationCode.create({
      code,
      deviceId: deviceUUID,
      section,
      isUsed: false,
      createdBy: req.user.id || null,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    res.status(201).json(newCode);
  } catch (error) {
    res.status(500).json({ message: 'Server error while creating activation code' });
  }
});

// POST /api/activation-codes/activate - Activate a code for a device
router.post('/activate', async (req, res) => {
  const { deviceId, activationCode } = req.body;
  if (!deviceId || !activationCode) {
    return res.status(400).json({ message: 'Device ID and activation code are required' });
  }
  try {
    const code = await ActivationCode.findOne({ where: { code: activationCode } });
    if (!code) {
      return res.status(404).json({ message: 'Activation code not found' });
    }
    if (code.isUsed) {
      return res.status(400).json({ message: 'Activation code has already been used' });
    }
    // Activate the code
    code.isUsed = true;
    code.deviceId = deviceId;
    code.activatedAt = new Date();
    await code.save();
    // Find or create the device
    let device = await Device.findOne({ where: { deviceId } });
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 547); // 1.5 years
    if (device) {
      device.subscriptionExpiresAt = subscriptionEndDate;
      await device.save();
    } else {
      device = await Device.create({
        deviceId,
        isSubscribed: true,
        subscriptionExpiresAt: subscriptionEndDate,
        activatedAt: new Date()
      });
    }
    res.status(200).json({ message: 'Subscription activated successfully', expiresAt: device.subscriptionExpiresAt });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred during activation' });
  }
});

module.exports = router; 