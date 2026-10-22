const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Seed admin for testing (In production, use a more secure way to create first admin)
router.post('/register-test', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(200).json({ message: 'Admin already exists' });
    }
    const admin = new Admin({ username, password });
    await admin.save();
    res.status(201).json({ message: 'Admin created' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Error creating admin', error: err.message });
  }
});

module.exports = router;
