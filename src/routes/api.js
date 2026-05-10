'use strict';

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');
const Blog = require('../models/Blog');
const { Contact, Volunteer, Program, Gallery, Testimonial, Subscriber } = require('../models/index');
const logger = require('../utils/logger');

// ─── Blog API ─────────────────────────────────────────────────────────
// GET /api/blogs
router.get('/blogs', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, status = 'published', search } = req.query;
    const filter = { status };
    if (category) filter.category = category;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
    ];

    const [posts, total] = await Promise.all([
      Blog.find(filter)
        .populate('author', 'name avatar')
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select('-content'),
      Blog.countDocuments(filter),
    ]);

    res.json({ success: true, data: posts, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

// POST /api/blogs (admin only)
router.post('/blogs', protect, restrictTo('super_admin', 'admin', 'editor'), [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('excerpt').trim().notEmpty().withMessage('Excerpt is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('category').isIn(['News', 'Programs', 'Stories', 'Awareness', 'Events', 'Reports']).withMessage('Invalid category'),
], validate, async (req, res, next) => {
  try {
    const post = await Blog.create({ ...req.body, author: req.user._id });
    res.status(201).json({ success: true, data: post });
  } catch (err) { next(err); }
});

// PUT /api/blogs/:id (admin only)
router.put('/blogs/:id', protect, restrictTo('super_admin', 'admin', 'editor'), async (req, res, next) => {
  try {
    const post = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (err) { next(err); }
});

// DELETE /api/blogs/:id (admin only)
router.delete('/blogs/:id', protect, restrictTo('super_admin', 'admin'), async (req, res, next) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) { next(err); }
});

// ─── Contact API ──────────────────────────────────────────────────────
router.put('/contacts/:id/status', protect, restrictTo('super_admin', 'admin'), async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, data: contact });
  } catch (err) { next(err); }
});

// ─── Volunteer API ────────────────────────────────────────────────────
router.put('/volunteers/:id/status', protect, restrictTo('super_admin', 'admin'), async (req, res, next) => {
  try {
    const update = { status: req.body.status };
    if (req.body.status === 'approved') {
      update.approvedAt = new Date();
      update.approvedBy = req.user._id;
    }
    const volunteer = await Volunteer.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, data: volunteer });
  } catch (err) { next(err); }
});

// ─── Gallery API ──────────────────────────────────────────────────────
router.post('/gallery', protect, restrictTo('super_admin', 'admin', 'editor'), upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Image file required' });

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'dabbah_foundation/gallery',
      resource_type: 'image',
      transformation: [{ width: 1200, height: 800, crop: 'fill', quality: 'auto:good' }],
    });

    const item = await Gallery.create({
      title: req.body.title || 'Gallery Image',
      description: req.body.description,
      category: req.body.category || 'events',
      image: { url: result.secure_url, publicId: result.public_id, alt: req.body.alt || req.body.title },
      featured: req.body.featured === 'true',
      uploadedBy: req.user._id,
    });

    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
});

router.delete('/gallery/:id', protect, restrictTo('super_admin', 'admin'), async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Image not found' });
    if (item.image?.publicId) await cloudinary.uploader.destroy(item.image.publicId);
    await item.deleteOne();
    res.json({ success: true, message: 'Image deleted' });
  } catch (err) { next(err); }
});

// ─── Testimonials API ─────────────────────────────────────────────────
router.put('/testimonials/:id/status', protect, restrictTo('super_admin', 'admin'), async (req, res, next) => {
  try {
    const t = await Testimonial.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, data: t });
  } catch (err) { next(err); }
});

// ─── Stats API (public) ───────────────────────────────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        youthReached: 5000,
        schoolsVisited: 120,
        communityPrograms: 48,
        volunteers: 200,
      },
    });
  } catch (err) { next(err); }
});

// ─── Newsletter Subscribe API ─────────────────────────────────────────
router.post('/subscribe', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
], validate, async (req, res, next) => {
  try {
    const { email, name } = req.body;
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      if (existing.status === 'unsubscribed') {
        existing.status = 'active';
        await existing.save();
        return res.json({ success: true, message: 'Welcome back! You have been resubscribed.' });
      }
      return res.json({ success: true, message: 'You are already subscribed.' });
    }
    await Subscriber.create({ email, name, source: 'footer' });
    res.json({ success: true, message: 'Successfully subscribed! Thank you for joining our community.' });
  } catch (err) { next(err); }
});

module.exports = router;
