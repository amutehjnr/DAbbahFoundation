'use strict';

const logger = require('../utils/logger');

const notFound = (req, res, next) => {
  const err = new Error(`Not Found — ${req.originalUrl}`);
  err.status = 404;
  next(err);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const isDev = process.env.NODE_ENV === 'development';

  if (statusCode >= 500) {
    logger.error(`${statusCode} — ${err.message} — ${req.method} ${req.originalUrl}`);
    if (isDev) logger.error(err.stack);
  }

  // API requests
  if (req.originalUrl.startsWith('/api')) {
    return res.status(statusCode).json({
      success: false,
      error: err.message || 'Internal Server Error',
      ...(isDev && { stack: err.stack }),
    });
  }

  // HTML requests
  res.status(statusCode).render('pages/error', {
    title: statusCode === 404 ? 'Page Not Found' : 'Server Error',
    statusCode,
    message: statusCode === 404
      ? 'The page you are looking for does not exist.'
      : isDev ? err.message : 'Something went wrong. Please try again later.',
  });
};

module.exports = { notFound, errorHandler };
