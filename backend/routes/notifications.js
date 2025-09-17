const express = require('express');
const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const router = express.Router();

const NOTIFICATIONS_FILE = path.join(__dirname, '../data/notifications.json');
const TOKENS_FILE = path.join(__dirname, '../data/tokens.json');
const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY || 'YOUR_FIREBASE_SERVER_KEY';

// Get all notifications
router.get('/', (req, res) => {
  fs.readFile(NOTIFICATIONS_FILE, (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read notifications' });
    res.json(JSON.parse(data));
  });
});

// Add a new notification and send to all users
router.post('/', async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Title and body required' });

  // Read tokens
  let tokens = [];
  try {
    tokens = JSON.parse(fs.readFileSync(TOKENS_FILE));
  } catch {
    tokens = [];
  }

  // Send notification via Expo Push
  if (tokens.length > 0) {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokens.map(token => ({
        to: token,
        sound: 'default',
        title,
        body,
      })))
    });
  }

  // Save notification in notifications.json
  fs.readFile(NOTIFICATIONS_FILE, (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read notifications' });
    const notifications = JSON.parse(data);
    const newNotification = {
      id: Date.now(),
      title,
      body,
      date: new Date().toISOString()
    };
    notifications.unshift(newNotification);
    fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2), err => {
      if (err) return res.status(500).json({ error: 'Failed to save notification' });
      res.json(newNotification);
    });
  });
});

module.exports = router; 