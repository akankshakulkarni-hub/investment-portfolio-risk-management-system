const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ================= SIGNUP =================
const signup = async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user exists
    const existing = await pool.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user (PostgreSQL uses RETURNING)
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING user_id',
      [name, email, hashedPassword, role]
    );

    const userId = result.rows[0].user_id;

    // Generate token
    const token = jwt.sign(
      { user_id: userId, email, role, name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created',
      token,
      user: { user_id: userId, name, email, role },
    });

  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    // Fetch user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        theme_preference: user.theme_preference,
      },
    });

  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ================= UPDATE THEME =================
const updateTheme = async (req, res) => {
  const { theme_preference } = req.body;
  const { user_id } = req.user;

  try {
    await pool.query(
      'UPDATE users SET theme_preference = $1 WHERE user_id = $2',
      [theme_preference, user_id]
    );

    res.json({ message: 'Theme updated' });

  } catch (err) {
    console.error('Theme Update Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= GET CURRENT USER =================
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, name, email, role, theme_preference, created_at FROM users WHERE user_id = $1',
      [req.user.user_id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error('GetMe Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  signup,
  login,
  updateTheme,
  getMe,
};