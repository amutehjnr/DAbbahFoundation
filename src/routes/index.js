'use strict';

const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const Blog = require('../models/Blog');
const { Program, Testimonial, Gallery } = require('../models/index');

// Home page
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const [recentPosts, programs, testimonials, gallery] = await Promise.all([
      Blog.find({ status: 'published' }).sort({ publishedAt: -1 }).limit(3).select('title slug excerpt coverImage category publishedAt author').populate('author', 'name'),
      Program.find({ status: 'active' }).sort({ order: 1 }).limit(6),
      Testimonial.find({ status: 'approved', featured: true }).sort({ order: 1 }).limit(6),
      Gallery.find({ featured: true }).sort({ order: 1 }).limit(9),
    ]);

    res.render('pages/home', {
      title: "D'Abbah Foundation — Building Hope. Restoring Lives.",
      description: "D'Abbah Foundation is a youth-focused NGO committed to preventing drug abuse and restoring hope among individuals and communities across Nigeria.",
      recentPosts,
      programs,
      testimonials,
      gallery,
      ogImage: '/images/og-home.jpg',
    });
  } catch (err) {
    next(err);
  }
});

// About page
router.get('/about', optionalAuth, (req, res) => {
  res.render('pages/about', {
    title: "About Us — D'Abbah Foundation",
    description: 'Learn about our mission, vision, and the team behind D\'Abbah Foundation.',
  });
});

// Programs page
router.get('/programs', optionalAuth, async (req, res, next) => {
  try {
    const programs = await Program.find({ status: 'active' }).sort({ order: 1 });
    res.render('pages/programs', {
      title: "Our Programs — D'Abbah Foundation",
      description: 'Discover our transformative programs empowering youth and communities across Nigeria.',
      programs,
    });
  } catch (err) { next(err); }
});

// Gallery page
router.get('/gallery', optionalAuth, async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const gallery = await Gallery.find(filter).sort({ order: 1, createdAt: -1 });
    res.render('pages/gallery', {
      title: "Gallery — D'Abbah Foundation",
      description: 'Photo gallery showcasing our impact across Nigeria.',
      gallery,
      activeCategory: category || 'all',
    });
  } catch (err) { next(err); }
});

// Donate page
router.get('/donate', optionalAuth, (req, res) => {
  res.render('pages/donate', {
    title: "Support Our Mission — D'Abbah Foundation",
    description: 'Your donation helps us reach more youth and communities. Every naira makes a difference.',
  });
});

// Volunteer page
router.get('/volunteer', optionalAuth, (req, res) => {
  res.render('pages/volunteer', {
    title: "Volunteer — D'Abbah Foundation",
    description: 'Join our team of passionate volunteers making a difference in Nigerian communities.',
  });
});

// Contact page
router.get('/contact', optionalAuth, (req, res) => {
  res.render('pages/contact', {
    title: "Contact Us — D'Abbah Foundation",
    description: 'Get in touch with the D\'Abbah Foundation team.',
  });
});

// Privacy Policy
router.get('/privacy-policy', (req, res) => {
  res.render('pages/privacy', {
    title: "Privacy Policy — D'Abbah Foundation",
    description: 'Our privacy policy and data protection commitment.',
  });
});

// Terms of Service
router.get('/terms', (req, res) => {
  res.render('pages/terms', {
    title: "Terms of Service — D'Abbah Foundation",
    description: 'Terms and conditions for using D\'Abbah Foundation website.',
  });
});

// Sitemap
router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const posts = await Blog.find({ status: 'published' }).select('slug updatedAt');
    const baseUrl = process.env.APP_URL || 'https://dabbahfoundation.org';

    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/about', priority: '0.9', changefreq: 'monthly' },
      { url: '/programs', priority: '0.9', changefreq: 'weekly' },
      { url: '/blog', priority: '0.8', changefreq: 'daily' },
      { url: '/gallery', priority: '0.7', changefreq: 'weekly' },
      { url: '/donate', priority: '0.8', changefreq: 'monthly' },
      { url: '/volunteer', priority: '0.7', changefreq: 'monthly' },
      { url: '/contact', priority: '0.6', changefreq: 'yearly' },
    ];

    const now = new Date().toISOString();
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const page of staticPages) {
      xml += `  <url><loc>${baseUrl}${page.url}</loc><lastmod>${now}</lastmod><changefreq>${page.changefreq}</changefreq><priority>${page.priority}</priority></url>\n`;
    }

    for (const post of posts) {
      xml += `  <url><loc>${baseUrl}/blog/${post.slug}</loc><lastmod>${post.updatedAt.toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>\n`;
    }

    xml += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) { next(err); }
});

// robots.txt
router.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.APP_URL || 'https://dabbahfoundation.org';
  res.setHeader('Content-Type', 'text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /auth\nDisallow: /api\nSitemap: ${baseUrl}/sitemap.xml\n`);
});

module.exports = router;
