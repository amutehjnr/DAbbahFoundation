# D'Abbah Foundation Website

> **Building Hope. Restoring Lives.**

A world-class, enterprise-grade NGO website for D'Abbah Foundation — Nigeria's youth-focused drug abuse prevention organization. Built with modern technologies, production-ready security, and a premium design system.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | EJS, Vanilla JS, CSS Custom Properties |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT, Sessions, bcryptjs, RBAC |
| **Payments** | Paystack, Flutterwave |
| **Media** | Cloudinary |
| **Email** | Nodemailer (SMTP) |
| **Security** | Helmet.js, CSRF, rate limiting, mongo-sanitize, HPP |
| **Hosting** | Render |
| **CDN/DNS** | Cloudflare |
| **CI/CD** | GitHub Actions |

---

## 📁 Project Structure

```
dabbah-foundation/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions pipeline
├── scripts/
│   └── seed.js                # Database seed script
├── src/
│   ├── server.js              # App entry point
│   ├── config/
│   │   ├── database.js        # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary config
│   ├── middleware/
│   │   ├── auth.js            # JWT + session auth
│   │   ├── errorHandler.js    # Global error handler
│   │   ├── upload.js          # Multer file uploads
│   │   └── validate.js        # express-validator helper
│   ├── models/
│   │   ├── User.js            # Admin user model
│   │   ├── Blog.js            # Blog post model
│   │   ├── Donation.js        # Donation model
│   │   └── index.js           # Contact, Volunteer, Program, Gallery, Testimonial, Subscriber
│   ├── routes/
│   │   ├── index.js           # Public pages
│   │   ├── auth.js            # Login/logout
│   │   ├── admin.js           # Admin dashboard
│   │   ├── api.js             # REST API endpoints
│   │   ├── donations.js       # Paystack/Flutterwave
│   │   ├── blog.js            # Blog listing/detail
│   │   ├── programs.js        # Programs page
│   │   ├── contact.js         # Contact form
│   │   └── volunteers.js      # Volunteer applications
│   ├── utils/
│   │   ├── logger.js          # Winston logger
│   │   └── email.js           # Nodemailer email service
│   ├── views/
│   │   ├── partials/
│   │   │   ├── head.ejs
│   │   │   ├── navbar.ejs
│   │   │   └── footer.ejs
│   │   ├── pages/
│   │   │   ├── home.ejs
│   │   │   ├── about.ejs
│   │   │   ├── programs.ejs
│   │   │   ├── blog.ejs
│   │   │   ├── blog-post.ejs
│   │   │   ├── gallery.ejs
│   │   │   ├── donate.ejs
│   │   │   ├── volunteer.ejs
│   │   │   ├── contact.ejs
│   │   │   ├── privacy.ejs
│   │   │   ├── terms.ejs
│   │   │   ├── error.ejs
│   │   │   └── auth/login.ejs
│   │   └── admin/
│   │       ├── dashboard.ejs
│   │       ├── partials/
│   │       │   ├── admin-sidebar.ejs
│   │       │   └── admin-topbar.ejs
│   │       ├── blog/ (index.ejs, editor.ejs)
│   │       ├── contacts/ (index.ejs)
│   │       ├── donations/ (index.ejs)
│   │       ├── gallery/ (index.ejs)
│   │       ├── programs/ (index.ejs)
│   │       ├── subscribers/ (index.ejs)
│   │       ├── testimonials/ (index.ejs)
│   │       └── volunteers/ (index.ejs)
│   └── public/
│       ├── css/
│       │   ├── main.css       # Design system + core styles
│       │   ├── pages.css      # Page-specific styles
│       │   └── admin.css      # Admin dashboard styles
│       ├── js/
│       │   └── main.js        # Core JS (navbar, carousel, counters)
│       ├── images/
│       │   ├── favicon.svg
│       │   ├── placeholder.jpg
│       │   └── og-default.jpg
│       └── manifest.json
├── .env.example               # Environment variables template
├── .gitignore
├── package.json
├── render.yaml                # Render hosting config
└── README.md
```

---

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/your-org/dabbah-foundation.git
cd dabbah-foundation
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Fill in all values in .env
```

### 3. Seed the Database
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
# → http://localhost:3000
```

### 5. Access Admin Dashboard
```
URL:      http://localhost:3000/admin
Email:    admin@dabbahfoundation.org
Password: Admin@2025!   (change immediately!)
```

---

## 🔐 Security Features

- **Helmet.js** — Security headers (CSP, HSTS, X-Frame-Options, etc.)
- **JWT + HTTP-only cookies** — Secure token storage
- **bcryptjs** — Password hashing (cost factor 12)
- **Session management** — MongoDB-backed, secure cookies
- **Rate limiting** — Global API + auth + contact endpoint limits
- **MongoDB sanitization** — Prevents NoSQL injection
- **HPP** — HTTP parameter pollution prevention
- **Input validation** — express-validator on all forms
- **RBAC** — Role-based access (super_admin, admin, editor, viewer)
- **CORS** — Configured for production origin
- **CSP** — Content Security Policy headers

---

## 💳 Payment Integration

### Paystack (Primary - NGN)
```env
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
```

### Flutterwave (Secondary)
```env
FLW_SECRET_KEY=FLWSECK_TEST-...
FLW_PUBLIC_KEY=FLWPUBK_TEST-...
FLW_ENCRYPTION_KEY=...
```

---

## 🌐 Deployment — Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repository
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add all environment variables from `.env.example`
6. Enable **Auto-Deploy** on push to `main`

---

## 🔧 Cloudflare Setup

1. Add your domain to Cloudflare
2. Set DNS records pointing to Render's IP
3. Enable **Proxy (orange cloud)** for CDN + DDoS protection
4. Set SSL/TLS to **Full (strict)**
5. Enable **Bot Fight Mode**
6. Configure **Page Rules** for caching static assets

---

## 📧 Email Configuration

Uses Nodemailer with SMTP. Recommended providers:
- **Gmail** (development): Use App Password
- **SendGrid** (production): Better deliverability
- **Mailgun** (production): High volume

---

## 🗄️ Database Backup Strategy

For production, enable **MongoDB Atlas** with:
- Automated daily backups (M10+ clusters)
- Point-in-time recovery
- Cross-region replication

---

## 📊 Admin Features

| Feature | Path |
|---|---|
| Dashboard | `/admin` |
| Blog Editor | `/admin/blog/new` |
| Donation Reports | `/admin/donations` |
| Contact Management | `/admin/contacts` |
| Volunteer Review | `/admin/volunteers` |
| Gallery Upload | `/admin/gallery` |
| Testimonials | `/admin/testimonials` |
| Programs | `/admin/programs` |
| Newsletter | `/admin/subscribers` |

---

## 🌟 Key Pages

| Page | URL |
|---|---|
| Home | `/` |
| About | `/about` |
| Programs | `/programs` |
| Blog | `/blog` |
| Gallery | `/gallery` |
| Donate | `/donate` |
| Volunteer | `/volunteer` |
| Contact | `/contact` |
| Sitemap | `/sitemap.xml` |

---

## 📄 License

Copyright © 2025 D'Abbah Foundation. All rights reserved.

---

*Built with ❤️ for a drug-free Nigeria.*
