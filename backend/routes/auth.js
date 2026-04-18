const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const Admin   = require('../models/Admin');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await admin.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin._id, email: admin.email, name: admin.name },
      process.env.JWT_SECRET || 'ara_secret',
      { expiresIn: '7d' }
    );

    res.json({ token, admin: { id: admin._id, email: admin.email, name: admin.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register (protected: only existing admin can create new admin)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, secretKey } = req.body;
    if (secretKey !== (process.env.ADMIN_SECRET || 'ARA_ADMIN_SETUP')) {
      return res.status(403).json({ error: 'Invalid setup key' });
    }
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Admin already exists' });

    const admin = await Admin.create({ email, password, name: name || 'Admin' });
    res.status(201).json({ message: 'Admin created', id: admin._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
