# 🌾 Krishify — Digital Mandi Platform

> A wholesale agricultural auction platform connecting farmers directly with verified buyers through physical inspection, AI quality assessment, and lot-based bidding.

[![Next.js](https://img.shields.io/badge/Next.js-13.5-black)](https://nextjs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)](https://mysql.com)
[![Razorpay](https://img.shields.io/badge/Razorpay-TEST_MODE-blue)](https://razorpay.com)

---

## 📖 What is Krishify?

Krishify is a **Digital Mandi** — a wholesale agricultural auction platform. It is **not** a retail e-commerce store.

### Core Business Model

```
FARMER creates crop lot (e.g. 5,000 kg wheat)
    ↓
Submits for Physical Inspection
    ↓
Inspector verifies quality on-site
    ↓
AI TEST Assessment runs after approval
    ↓
Lot goes live for whole-lot auction
    ↓
Verified Buyers bid in ₹ per Quintal
    ↓
Highest bid wins the entire lot
    ↓
Example: 50 quintals × ₹2,625/q = ₹1,31,250
    ↓
Razorpay TEST Payment
    ↓
Delivery Tracking (CREATED → DELIVERED)
    ↓
Buyer Review
```

### Buyer Types
- 🏛️ Government Procurement Agencies
- 🏭 Private Food Processing Companies
- 🤝 Licensed Traders
- 🌾 Farmer Cooperatives

---

## 🚀 Getting Started (Local)

### Prerequisites
- Node.js 18+
- MySQL 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/rudraabhishek-collab/KrishyFY-.git
cd KrishyFY-/krishify

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Variables

Create `krishify/.env`:

```env
DATABASE_URL=mysql://root:ROOT@localhost:3306/krishify
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
AI_PROVIDER=TEST
```

### Database Setup

```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS krishify;"

# Run migrations (if using Prisma)
npx prisma db push
```

### Run Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 👥 Test Accounts

| Role | Email | Password | Access |
|------|-------|----------|--------|
| 🌾 Farmer | `farmer@test.com` | `test123` | Create lots, manage auctions |
| 🛒 Buyer | `buyer@test.com` | `test123` | Browse lots, place bids |
| 🔍 Inspector | `inspector@krishify.com` | `Inspector@123` | Inspect and approve lots |
| ⚙️ Admin | `admin@krishify.com` | `Inspector@123` | Full platform management |

---

## 🚢 Vercel Deployment

### Step 1 — Set Root Directory

In **Vercel Dashboard → Project → Settings → General**:

```
Root Directory: krishify
```

This is required because the Next.js app lives inside the `krishify/` subdirectory.

### Step 2 — Environment Variables

In **Vercel Dashboard → Project → Settings → Environment Variables**:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `mysql://user:password@hostname:3306/krishify` |
| `RAZORPAY_KEY_ID` | Your Razorpay TEST Key ID |
| `RAZORPAY_KEY_SECRET` | Your Razorpay TEST Key Secret |
| `AI_PROVIDER` | `TEST` |

### Step 3 — Remote MySQL Database

Vercel serverless functions cannot connect to `localhost`. Use a remote MySQL provider:

| Provider | Free Tier | Notes |
|----------|-----------|-------|
| [Railway](https://railway.app) | ✅ $5 credit | Easiest setup |
| [PlanetScale](https://planetscale.com) | ✅ Free plan | MySQL-compatible |
| [Aiven](https://aiven.io) | ✅ Free trial | Production-ready |

**DATABASE_URL format:**
```
mysql://username:password@hostname:3306/krishify
```

**For PlanetScale (with SSL):**
```
mysql://username:password@hostname/krishify?ssl=true
```

### Step 4 — Deploy

```bash
git push origin main
```

Vercel auto-deploys on every push to `main`.

---

## �️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 13.5 (Pages Router) | Frontend + API routes |
| MySQL 8 + mysql2 | Database |
| Tailwind CSS 3 | Styling |
| bcrypt | Password hashing |
| Session cookies | Authentication |
| Razorpay TEST | Payment gateway |
| AI_PROVIDER=TEST | Crop quality assessment |

---

## 📁 Project Structure

```
KrishyFY-/
├── krishify/              ← Next.js application root
│   ├── components/        ← Shared components (Navbar)
│   ├── lib/               ← Utilities (db.js, auth, AI, notifications)
│   ├── pages/             ← Next.js pages
│   │   ├── api/           ← REST API routes
│   │   ├── admin/         ← Admin dashboard pages
│   │   ├── farmer/        ← Farmer pages (lots, auctions, orders)
│   │   ├── inspector/     ← Inspector dashboard
│   │   ├── marketplace/   ← Mandi lot browsing
│   │   ├── auctions/      ← Live auction board
│   │   └── orders/        ← Order management
│   ├── prisma/            ← Database schema
│   ├── styles/            ← Global CSS
│   └── vercel.json        ← Vercel config
└── vercel.json            ← Root config (sets rootDirectory)
```

---

## 🔑 Key Features

### For Farmers
- 📋 Create whole-lot crop listings with quantity in KG
- 📊 Live quintal/tonne conversion and lot value preview
- 🔍 Submit lots for physical quality inspection
- 🏷️ Create timed auctions on verified lots
- 📦 Manage orders and track deliveries
- 🔔 Real-time notifications for bids and orders

### For Buyers
- 🌾 Browse verified mandi lots
- 🔍 View physical inspection results (official verification)
- 🤖 View AI quality assessment (TEST/DEMO)
- 🏷️ Bid in ₹ per quintal — server calculates total value
- 💳 Razorpay TEST payments
- 🚚 Track deliveries from PACKED to DELIVERED
- ⭐ Review completed wholesale transactions

### For Inspectors
- 📋 Inspection queue with all pending lots
- ✅ Approve / ❌ Reject / 🔁 Request Reinspection
- Record Grade, Moisture %, Foreign Matter %, Damaged %, Weight
- Farmer automatically notified on decision

### For Admins
- 📊 Platform dashboard with real-time stats
- 👥 User management (all roles)
- 🌾 Lot monitoring and management
- 🏷️ Auction monitoring
- 📦 Order tracking
- 💳 Payment records (TEST mode)
- 🚚 Delivery management
- ⭐ Review moderation

---

## ⚠️ Important Notes

- **Razorpay is in TEST MODE** — no real money is charged
- **AI assessment is DEMO/TEST** — randomly generated quality scores
- **No real courier APIs** — delivery tracking is manual/demo
- **Physical inspection is the official quality verification**
- AI assessment only runs after physical inspection is APPROVED
- Buyers bid on the **complete lot** — no partial/retail purchases

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with ❤️ for India's farmers — Krishify Digital Mandi*
