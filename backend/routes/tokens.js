const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const TOKENS_FILE = path.join(__dirname, '../data/tokens.json');

// Save or update user token
router.post('/', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token required' });

  let tokens = [];
  try {
    tokens = JSON.parse(fs.readFileSync(TOKENS_FILE));
  } catch {
    tokens = [];
  }

  if (!tokens.includes(token)) {
    tokens.push(token);
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
  }

  res.json({ success: true });
});

module.exports = router; 