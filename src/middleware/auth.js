'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Protect routes — verifies JWT from cookie or Authorization header
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(401).json({ success: false, error: 'Authentication required.' });
      }
      return res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, error: 'User not found or inactive.' });
    }

    req.user = user;
    res.locals.user = user;
    next();
  } catch (err) {
    logger.warn(`Auth middleware error: ${err.message}`);
    if (req.originalUrl.startsWith('/api')) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
    }
    res.redirect('/auth/login');
  }
};

/**
 * Role-based access control
 * @param  {...string} roles - Allowed roles
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(403).json({ success: false, error: 'Access denied. Insufficient permissions.' });
    }
    return res.status(403).render('pages/error', {
      title: 'Access Denied',
      statusCode: 403,
      message: 'You do not have permission to access this resource.',
    });
  }
  next();
};

/**
 * Session-based admin check (for EJS pages)
 */
const requireSession = (req, res, next) => {
  if (!req.session?.user) {
    return res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
  }
  res.locals.user = req.session.user;
  next();
};

/**
 * Optional auth — attach user if available but don't block
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user?.isActive) {
        req.user = user;
        res.locals.user = user;
      }
    }
  } catch (_) {
    // silent fail
  }
  next();
};

module.exports = { protect, restrictTo, requireSession, optionalAuth };
