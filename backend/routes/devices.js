const express = require('express');
const router = express.Router();
const { Device, ActivationCode } = require('../models');
const auth = require('../middleware/auth');

// GET /api/devices/status/:deviceId - Check subscription status of a device
router.get('/status/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    if (!deviceId) {
      return res.status(400).json({ message: 'Device ID is required' });
    }
    const device = await Device.findOne({ where: { deviceId } });
    if (!device) {
      return res.json({ isActive: false, section: null, expiresAt: null, deviceId });
    }
    const isExpired = new Date() > new Date(device.subscriptionExpiresAt);
    if (isExpired) {
      return res.json({ isActive: false, section: device.section || null, expiresAt: device.subscriptionExpiresAt, deviceId });
    }
    res.json({ isActive: true, section: device.section || null, expiresAt: device.subscriptionExpiresAt, deviceId });
  } catch (error) {
    res.status(500).json({ message: 'Server error while checking device status' });
  }
});

// POST /api/devices/activate - Activate a subscription for a device
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