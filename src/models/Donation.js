'use strict';

const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: String,
    anonymous: { type: Boolean, default: false },
  },
  amount: {
    type: Number,
    required: [true, 'Donation amount is required'],
    min: [100, 'Minimum donation is ₦100'],
  },
  currency: {
    type: String,
    enum: ['NGN', 'USD', 'GBP', 'EUR'],
    default: 'NGN',
  },
  gateway: {
    type: String,
    enum: ['paystack', 'flutterwave', 'stripe', 'manual'],
    required: true,
  },
  reference: {
    type: String,
    unique: true,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending',
  },
  purpose: {
    type: String,
    enum: ['general', 'school_program', 'recovery_support', 'youth_leadership', 'emergency'],
    default: 'general',
  },
  message: { type: String, maxlength: 500 },
  recurring: {
    isRecurring: { type: Boolean, default: false },
    frequency: { type: String, enum: ['monthly', 'quarterly', 'annually'] },
    nextPaymentDate: Date,
    subscriptionCode: String,
  },
  metadata: mongoose.Schema.Types.Mixed,
  verifiedAt: Date,
  receiptSentAt: Date,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

donationSchema.index({ 'donor.email': 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ gateway: 1, reference: 1 });
donationSchema.index({ createdAt: -1 });

// Virtual for formatted amount
donationSchema.virtual('formattedAmount').get(function () {
  return `₦${this.amount.toLocaleString()}`;
});

const Donation = mongoose.model('Donation', donationSchema);
module.exports = Donation;
