'use strict';
// Append gallery-url endpoint to api.js
// This file patches the API router to support direct URL gallery uploads

const express = require('express');
const { Gallery } = require('../models/index');
const { protect, restrictTo } = require('../middleware/auth');

const galleryUrlRouter = express.Router();

galleryUrlRouter.post('/gallery-url', protect, restrictTo('super_admin', 'admin', 'editor'), async (req, res, next) => {
  try {
    const { imageUrl, title, alt, category, featured } = req.body;
    if (!imageUrl) return res.status(400).json({ success: false, error: 'imageUrl is required' });

    const item = await Gallery.create({
      title: title || 'Gallery Image',
      image: { url: imageUrl, publicId: '', alt: alt || title || 'Gallery image' },
      category: category || 'events',
      featured: !!featured,
      uploadedBy: req.user._id,
    });

    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
});

module.exports = galleryUrlRouter;
