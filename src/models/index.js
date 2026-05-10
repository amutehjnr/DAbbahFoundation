'use strict';

const mongoose = require('mongoose');

// ─── Contact Submission ──────────────────────────────────────────────
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: String,
  subject: {
    type: String,
    enum: ['General Inquiry', 'Partnership', 'Volunteer', 'Donations', 'Program Information', 'Media / Press', 'Other'],
    default: 'General Inquiry',
  },
  message: { type: String, required: true, maxlength: 2000 },
  status: { type: String, enum: ['unread', 'read', 'replied', 'archived'], default: 'unread' },
  ipAddress: String,
  userAgent: String,
  repliedAt: Date,
  repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ─── Volunteer ───────────────────────────────────────────────────────
const volunteerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  age: Number,
  occupation: String,
  location: String,
  skills: [String],
  availability: {
    type: String,
    enum: ['weekdays', 'weekends', 'both', 'remote_only'],
    default: 'weekends',
  },
  programs: [{
    type: String,
    enum: ['school_sensitization', 'recovery_support', 'youth_leadership', 'parent_workshops', 'admin'],
  }],
  motivation: { type: String, maxlength: 1000 },
  status: { type: String, enum: ['pending', 'approved', 'active', 'inactive', 'rejected'], default: 'pending' },
  approvedAt: Date,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ─── Program ─────────────────────────────────────────────────────────
const programSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, required: true },
  shortDescription: { type: String, maxlength: 200 },
  icon: String,
  coverImage: { url: String, publicId: String },
  category: String,
  impact: { beneficiaries: Number, sessions: Number, locations: Number },
  status: { type: String, enum: ['active', 'inactive', 'upcoming'], default: 'active' },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

// ─── Gallery ─────────────────────────────────────────────────────────
const gallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  image: { url: String, publicId: String, alt: String },
  category: {
    type: String,
    enum: ['events', 'programs', 'community', 'team', 'other'],
    default: 'events',
  },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// ─── Testimonial ─────────────────────────────────────────────────────
const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: String, // e.g. "Parent", "Recovered Youth", "Teacher"
  location: String,
  quote: { type: String, required: true, maxlength: 600 },
  avatar: { url: String, publicId: String },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

// ─── Newsletter Subscriber ────────────────────────────────────────────
const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: String,
  status: { type: String, enum: ['active', 'unsubscribed'], default: 'active' },
  source: { type: String, default: 'website' },
  unsubscribeToken: String,
}, { timestamps: true });

module.exports = {
  Contact: mongoose.model('Contact', contactSchema),
  Volunteer: mongoose.model('Volunteer', volunteerSchema),
  Program: mongoose.model('Program', programSchema),
  Gallery: mongoose.model('Gallery', gallerySchema),
  Testimonial: mongoose.model('Testimonial', testimonialSchema),
  Subscriber: mongoose.model('Subscriber', subscriberSchema),
};
