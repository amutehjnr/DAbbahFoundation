'use strict';

/**
 * D'Abbah Foundation — Database Seed Script
 * Usage: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const { Program, Testimonial, Gallery, Subscriber } = require('../src/models/index');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // ── Admin User
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!existingAdmin) {
      await User.create({
        name: "Foundation Admin",
        email: process.env.ADMIN_EMAIL || 'admin@dabbahfoundation.org',
        password: process.env.ADMIN_PASSWORD || 'Admin@2025!',
        role: 'super_admin',
        isActive: true,
      });
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // ── Programs
    const programsData = [
      {
        title: 'School Sensitization Program',
        slug: 'school-sensitization-program',
        shortDescription: 'Awareness sessions in schools educating students on drug risks and prevention.',
        description: 'Our School Sensitization Program delivers age-appropriate, evidence-based drug education sessions in primary and secondary schools across Nigeria. Trained facilitators engage students with interactive workshops, helping them understand the risks of drug abuse and build personal resilience against peer pressure.',
        icon: '🏫',
        category: 'Education',
        impact: { beneficiaries: 3000, sessions: 85, locations: 40 },
        status: 'active',
        featured: true,
        order: 1,
      },
      {
        title: 'Community Recovery Support Groups',
        slug: 'community-recovery-support-groups',
        shortDescription: 'Weekly support meetings for individuals and families affected by drug abuse.',
        description: 'Our Community Recovery Support Groups provide safe, confidential weekly spaces where individuals in recovery and their families can share experiences, receive emotional support, and access practical guidance. Groups are led by trained facilitators and peer counselors who understand the recovery journey firsthand.',
        icon: '🤝',
        category: 'Recovery',
        impact: { beneficiaries: 800, sessions: 200, locations: 15 },
        status: 'active',
        featured: true,
        order: 2,
      },
      {
        title: 'Youth Leadership Training',
        slug: 'youth-leadership-training',
        shortDescription: 'Training programs raising young ambassadors for drug-free advocacy.',
        description: 'The Youth Leadership Training program equips motivated young Nigerians with leadership skills, communication tools, and community organizing knowledge to become effective drug-free advocates in their schools and neighborhoods. Graduates become certified Youth Ambassadors for the foundation.',
        icon: '🌟',
        category: 'Leadership',
        impact: { beneficiaries: 450, sessions: 24, locations: 8 },
        status: 'active',
        featured: true,
        order: 3,
      },
      {
        title: 'Parent Empowerment Workshops',
        slug: 'parent-empowerment-workshops',
        shortDescription: 'Sessions equipping parents with knowledge to guide and support their children.',
        description: 'Our Parent Empowerment Workshops give parents and guardians the knowledge, language, and strategies they need to have meaningful conversations with their children about drugs, recognize early warning signs of substance use, and build protective family environments that support healthy development.',
        icon: '👨‍👩‍👧',
        category: 'Family',
        impact: { beneficiaries: 600, sessions: 40, locations: 20 },
        status: 'active',
        featured: true,
        order: 4,
      },
      {
        title: 'Rehabilitation Referral Network',
        slug: 'rehabilitation-referral-network',
        shortDescription: 'Connecting individuals to professional treatment and recovery centers.',
        description: 'Through our Rehabilitation Referral Network, we connect individuals struggling with drug dependency to vetted, professional treatment and recovery centers across Nigeria. Our team provides compassionate case management, follow-up support, and transition assistance to ensure continuity of care.',
        icon: '🏥',
        category: 'Healthcare',
        impact: { beneficiaries: 250, sessions: 0, locations: 30 },
        status: 'active',
        featured: true,
        order: 5,
      },
    ];

    for (const prog of programsData) {
      await Program.findOneAndUpdate({ slug: prog.slug }, prog, { upsert: true, new: true });
    }
    console.log('✅ Programs seeded');

    // ── Testimonials
    const testimonials = [
      {
        name: 'Amaka O.',
        role: 'Parent',
        location: 'Abuja, FCT',
        quote: "D'Abbah Foundation's parent workshop changed everything for our family. I finally knew how to talk to my son about drugs without pushing him away. Six months later, he's thriving in school and at home.",
        rating: 5, status: 'approved', featured: true, order: 1,
      },
      {
        name: 'Emmanuel T.',
        role: 'Recovered Youth',
        location: 'Lagos State',
        quote: "I was 17 and heading down a dangerous path. The recovery support group gave me community and purpose when I had none. Today I volunteer and give back what I received. Forever grateful.",
        rating: 5, status: 'approved', featured: true, order: 2,
      },
      {
        name: 'Mrs. Chidinma A.',
        role: 'School Teacher',
        location: 'Port Harcourt',
        quote: "After the school sensitization program, our students began reporting peer pressure to counselors instead of succumbing to it. The difference in school culture within just one term was truly profound.",
        rating: 5, status: 'approved', featured: true, order: 3,
      },
      {
        name: 'Ibrahim M.',
        role: 'Youth Ambassador',
        location: 'Kano State',
        quote: "The Youth Leadership Training gave me skills I use every day — not just to stay drug-free, but to lead, speak, and inspire others in my community to do the same. It changed my life trajectory.",
        rating: 5, status: 'approved', featured: true, order: 4,
      },
    ];

    for (const t of testimonials) {
      await Testimonial.findOneAndUpdate({ name: t.name, role: t.role }, t, { upsert: true, new: true });
    }
    console.log('✅ Testimonials seeded');

    console.log('\n🎉 Database seeded successfully!');
    console.log(`\n📧 Admin Login:\n   Email: ${process.env.ADMIN_EMAIL || 'admin@dabbahfoundation.org'}\n   Password: ${process.env.ADMIN_PASSWORD || 'Admin@2025!'}\n`);

  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
