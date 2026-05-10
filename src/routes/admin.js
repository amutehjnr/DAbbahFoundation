'use strict';

const express = require('express');
const router = express.Router();
const { requireSession } = require('../middleware/auth');
const Blog = require('../models/Blog');
const Donation = require('../models/Donation');
const { Contact, Volunteer, Program, Gallery, Testimonial, Subscriber } = require('../models/index');

// All admin routes require session authentication
router.use(requireSession);

// ─── Dashboard ───────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const [totalDonations, donationAmount, contacts, volunteers, posts, programs] = await Promise.all([
      Donation.countDocuments({ status: 'success' }),
      Donation.aggregate([{ $match: { status: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Contact.countDocuments({ status: 'unread' }),
      Volunteer.countDocuments({ status: 'pending' }),
      Blog.countDocuments({ status: 'published' }),
      Program.countDocuments({ status: 'active' }),
    ]);

    const recentDonations = await Donation.find({ status: 'success' }).sort({ createdAt: -1 }).limit(5);
    const recentContacts = await Contact.find().sort({ createdAt: -1 }).limit(5);

    res.render('admin/dashboard', {
      title: 'Dashboard — D\'Abbah Admin',
      layout: 'admin',
      stats: {
        totalDonations,
        donationAmount: donationAmount[0]?.total || 0,
        unreadContacts: contacts,
        pendingVolunteers: volunteers,
        publishedPosts: posts,
        activePrograms: programs,
      },
      recentDonations,
      recentContacts,
    });
  } catch (err) { next(err); }
});

// ─── Blog Management ─────────────────────────────────────────────────
router.get('/blog', async (req, res, next) => {
  try {
    const { page = 1, status, category } = req.query;
    const limit = 20;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const [posts, total] = await Promise.all([
      Blog.find(filter).populate('author', 'name').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Blog.countDocuments(filter),
    ]);

    res.render('admin/blog/index', {
      title: 'Blog Management — Admin',
      layout: 'admin',
      posts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      filter: { status, category },
    });
  } catch (err) { next(err); }
});

router.get('/blog/new', (req, res) => {
  res.render('admin/blog/editor', {
    title: 'New Post — Admin',
    layout: 'admin',
    post: null,
  });
});

router.get('/blog/:id/edit', async (req, res, next) => {
  try {
    const post = await Blog.findById(req.params.id).populate('author', 'name');
    if (!post) return res.status(404).render('pages/error', { title: 'Not Found', statusCode: 404, message: 'Post not found.' });
    res.render('admin/blog/editor', {
      title: `Edit: ${post.title} — Admin`,
      layout: 'admin',
      post,
    });
  } catch (err) { next(err); }
});

// ─── Donations Management ─────────────────────────────────────────────
router.get('/donations', async (req, res, next) => {
  try {
    const { page = 1, status, gateway } = req.query;
    const limit = 25;
    const filter = {};
    if (status) filter.status = status;
    if (gateway) filter.gateway = gateway;

    const [donations, total, analytics] = await Promise.all([
      Donation.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Donation.countDocuments(filter),
      Donation.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: '$currency', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
    ]);

    res.render('admin/donations/index', {
      title: 'Donations — Admin',
      layout: 'admin',
      donations,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      analytics,
      filter: { status, gateway },
    });
  } catch (err) { next(err); }
});

// ─── Contacts Management ──────────────────────────────────────────────
router.get('/contacts', async (req, res, next) => {
  try {
    const { page = 1, status } = req.query;
    const limit = 20;
    const filter = status ? { status } : {};
    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Contact.countDocuments(filter),
    ]);
    res.render('admin/contacts/index', {
      title: 'Contact Submissions — Admin',
      layout: 'admin',
      contacts,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      filter: { status },
    });
  } catch (err) { next(err); }
});

// ─── Volunteers Management ────────────────────────────────────────────
router.get('/volunteers', async (req, res, next) => {
  try {
    const { page = 1, status } = req.query;
    const limit = 20;
    const filter = status ? { status } : {};
    const [volunteers, total] = await Promise.all([
      Volunteer.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Volunteer.countDocuments(filter),
    ]);
    res.render('admin/volunteers/index', {
      title: 'Volunteers — Admin',
      layout: 'admin',
      volunteers,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      filter: { status },
    });
  } catch (err) { next(err); }
});

// ─── Gallery Management ───────────────────────────────────────────────
router.get('/gallery', async (req, res, next) => {
  try {
    const gallery = await Gallery.find().sort({ order: 1, createdAt: -1 });
    res.render('admin/gallery/index', {
      title: 'Gallery — Admin',
      layout: 'admin',
      gallery,
    });
  } catch (err) { next(err); }
});

// ─── Testimonials Management ──────────────────────────────────────────
router.get('/testimonials', async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    res.render('admin/testimonials/index', {
      title: 'Testimonials — Admin',
      layout: 'admin',
      testimonials,
    });
  } catch (err) { next(err); }
});

// ─── Programs Management ──────────────────────────────────────────────
router.get('/programs', async (req, res, next) => {
  try {
    const programs = await Program.find().sort({ order: 1 });
    res.render('admin/programs/index', {
      title: 'Programs — Admin',
      layout: 'admin',
      programs,
    });
  } catch (err) { next(err); }
});

// ─── Subscribers ──────────────────────────────────────────────────────
router.get('/subscribers', async (req, res, next) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.render('admin/subscribers/index', {
      title: 'Newsletter Subscribers — Admin',
      layout: 'admin',
      subscribers,
    });
  } catch (err) { next(err); }
});

module.exports = router;
