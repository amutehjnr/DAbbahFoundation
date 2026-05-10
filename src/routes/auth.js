'use strict';

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
});

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRES) || 7) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  res.status(statusCode).json({ success: true, token, data: { user } });
};

// GET /auth/login
router.get('/login', (req, res) => {
  if (req.session?.user) return res.redirect('/admin');
  res.render('pages/auth/login', {
    title: 'Admin Login — D\'Abbah Foundation',
    description: 'Secure admin login portal.',
    redirect: req.query.redirect || '/admin',
    error: req.session?.flashError || null,
  });
  delete req.session?.flashError;
});

// POST /auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], validate, async (req, res, next) => {
  try {
    const { email, password, redirect } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      if (req.headers['content-type']?.includes('application/json')) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }
      req.session.flashError = 'Invalid email or password.';
      return res.redirect('/auth/login');
    }

    if (!user.isActive) {
      req.session.flashError = 'Your account has been deactivated. Contact the administrator.';
      return res.redirect('/auth/login');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Set session
    req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };

    if (req.headers['content-type']?.includes('application/json')) {
      return sendToken(user, 200, res);
    }

    res.redirect(redirect || '/admin');
  } catch (err) { next(err); }
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) logger.error('Session destroy error:', err);
    res.clearCookie('jwt');
    res.clearCookie('__dabbah_sess');
    res.redirect('/auth/login');
  });
});

// GET /auth/logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('jwt');
    res.clearCookie('__dabbah_sess');
    res.redirect('/');
  });
});

// GET /auth/me (API)
router.get('/me', protect, (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

module.exports = router;
