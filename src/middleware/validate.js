'use strict';

const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errMessages = errors.array().map((e) => e.msg);
    if (req.originalUrl.startsWith('/api')) {
      return res.status(422).json({ success: false, errors: errMessages });
    }
    req.session.flashError = errMessages.join('. ');
    return res.redirect('back');
  }
  next();
};

module.exports = validate;
