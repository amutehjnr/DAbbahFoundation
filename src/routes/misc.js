'use strict';

const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const logger = require('../utils/logger');

// ─── Donation Router ──────────────────────────────────────────────
const donationRouter = express.Router();
const Donation = require('../models/Donation');

donationRouter.post('/initiate/paystack', [
  body('email').isEmail().normalizeEmail(),
  body('amount').isNumeric().isInt({ min: 100 }),
  body('name').trim().notEmpty(),
], validate, async (req, res, next) => {
  try {
    const { email, amount, name, purpose, message, anonymous } = req.body;
    const reference = 'DAF-PS-' + uuidv4().substring(0, 12).toUpperCase();
    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      email, amount: amount * 100, reference,
      metadata: { name, purpose: purpose || 'general', message, anonymous },
    }, { headers: { Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY } });
    await Donation.create({
      donor: { name: anonymous ? 'Anonymous' : name, email, anonymous: !!anonymous },
      amount: parseInt(amount), currency: 'NGN', gateway: 'paystack',
      reference, status: 'pending', purpose: purpose || 'general', message,
    });
    res.json({ success: true, data: response.data.data });
  } catch (err) { next(err); }
});

donationRouter.get('/verify/paystack/:reference', async (req, res, next) => {
  try {
    const { reference } = req.params;
    const response = await axios.get('https://api.paystack.co/transaction/verify/' + reference, {
      headers: { Authorization: 'Bearer ' + process.env.PAYSTACK_SECRET_KEY },
    });
    const donation = await Donation.findOne({ reference });
    if (!donation) return res.status(404).json({ success: false, error: 'Donation record not found' });
    if (response.data.data.status === 'success') {
      donation.status = 'success'; donation.verifiedAt = new Date(); donation.metadata = response.data.data;
      await donation.save();
      return res.redirect('/donate?status=success&ref=' + reference);
    }
    donation.status = 'failed'; await donation.save();
    res.redirect('/donate?status=failed');
  } catch (err) { next(err); }
});

donationRouter.post('/webhook/paystack', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const crypto = require('crypto');
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(body).digest('hex');
    if (hash !== req.headers['x-paystack-signature']) return res.status(401).send('Invalid signature');
    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (event.event === 'charge.success') {
      await Donation.findOneAndUpdate({ reference: event.data.reference }, { status: 'success', verifiedAt: new Date(), metadata: event.data });
    }
    res.sendStatus(200);
  } catch (err) { logger.error('Webhook error:', err.message); res.sendStatus(500); }
});

// ─── Blog Router ──────────────────────────────────────────────────
const blogRouter = express.Router();
const Blog = require('../models/Blog');

blogRouter.get('/', async (req, res, next) => {
  try {
    const { page = 1, category, search } = req.query;
    const limit = 9;
    const filter = { status: 'published' };
    if (category) filter.category = category;
    if (search) filter.$or = [{ title: { $regex: search, $options: 'i' } }, { excerpt: { $regex: search, $options: 'i' } }];
    const [posts, total, featured] = await Promise.all([
      Blog.find(filter).populate('author', 'name').sort({ publishedAt: -1 }).skip((page - 1) * limit).limit(limit).select('-content'),
      Blog.countDocuments(filter),
      Blog.findOne({ status: 'published', featured: true }).populate('author', 'name').sort({ publishedAt: -1 }),
    ]);
    res.render('pages/blog', {
      title: "Blog & News — D'Abbah Foundation", description: "Latest stories from D'Abbah Foundation.",
      posts, featured, total, page: parseInt(page), pages: Math.ceil(total / limit), filter: { category, search },
    });
  } catch (err) { next(err); }
});

blogRouter.get('/:slug', async (req, res, next) => {
  try {
    const post = await Blog.findOne({ slug: req.params.slug, status: 'published' }).populate('author', 'name avatar');
    if (!post) return next(Object.assign(new Error('Post not found'), { status: 404 }));
    post.views = (post.views || 0) + 1;
    await post.save({ validateBeforeSave: false });
    const related = await Blog.find({ status: 'published', category: post.category, _id: { $ne: post._id } }).limit(3).select('title slug excerpt coverImage publishedAt');
    res.render('pages/blog-post', {
      title: post.title + " — D'Abbah Foundation", description: post.excerpt, ogImage: post.coverImage && post.coverImage.url, post, related,
    });
  } catch (err) { next(err); }
});

// ─── Contact Router ───────────────────────────────────────────────
const contactRouter = express.Router();
const { Contact } = require('../models/index');

contactRouter.post('/', [
  body('name').trim().notEmpty().isLength({ max: 100 }).withMessage('Name required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('message').trim().notEmpty().isLength({ min: 10, max: 2000 }).withMessage('Message required'),
], validate, async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    await Contact.create({ name, email, phone, subject: subject || 'General Inquiry', message, ipAddress: req.ip, userAgent: req.get('User-Agent') });
    res.json({ success: true, message: "Thank you! We'll respond within 24-48 hours." });
  } catch (err) { next(err); }
});

// ─── Volunteer Router ─────────────────────────────────────────────
const volunteerRouter = express.Router();
const { Volunteer } = require('../models/index');

volunteerRouter.post('/', [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').trim().notEmpty().withMessage('Phone required'),
], validate, async (req, res, next) => {
  try {
    const { name, email, phone, age, occupation, location, skills, availability, programs, motivation } = req.body;
    await Volunteer.create({ name, email, phone, age, occupation, location, skills, availability, programs, motivation });
    res.json({ success: true, message: "Application received! We'll be in touch within 3-5 business days." });
  } catch (err) { next(err); }
});

// ─── Program Router ───────────────────────────────────────────────
const programRouter = express.Router();
const { Program } = require('../models/index');

programRouter.get('/', async (req, res, next) => {
  try {
    const programs = await Program.find({ status: 'active' }).sort({ order: 1 });
    res.render('pages/programs', {
      title: "Our Programs — D'Abbah Foundation",
      description: 'Transformative programs creating drug-free communities across Nigeria.',
      programs,
    });
  } catch (err) { next(err); }
});

module.exports = { donationRouter, blogRouter, contactRouter, volunteerRouter, programRouter };
