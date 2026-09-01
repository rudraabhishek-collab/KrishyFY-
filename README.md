# Krishify — Digital Mandi / Wholesale Agricultural Auction Platform

A digital agricultural marketplace connecting farmers directly with government agencies, private companies, traders, and cooperatives through whole-lot auctions.

## 🌾 What is Krishify?

Krishify is a **Digital Mandi** — not retail e-commerce. Farmers list entire crop lots (e.g. 5,000 kg = 50 quintals), physical inspectors verify quality, then verified buyers bid in ₹/quintal on the complete lot.

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- MySQL 8+

### Setup

```bash
cd krishify
npm install
```

Create a `.env` file in `krishify/`:
```env
DATABASE_URL=mysql://root:ROOT@localhost:3306/krishify
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
AI_PROVIDER=TEST
```

Start dev server:
```bash
npm run dev
```

Visit: http://localhost:3000

### Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Farmer | farmer@test.com | test123 |
| Buyer | buyer@test.com | test123 |
| Inspector | inspector@krishify.com | Inspector@123 |
| Admin | admin@krishify.com | Inspector@123 |

## 🚢 Vercel Deployment

### Step 1: Set Root Directory
In Vercel project settings → **Root Directory** → set to `krishify`

### Step 2: Environment Variables
Add these in Vercel project settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `mysql://user:pass@host:3306/krishify` |
| `RAZORPAY_KEY_ID` | Your Razorpay TEST key ID |
| `RAZORPAY_KEY_SECRET` | Your Razorpay TEST key secret |
| `AI_PROVIDER` | `TEST` |

### Step 3: Remote MySQL
Use a managed MySQL service:
- [PlanetScale](https://planetscale.com) (free tier)
- [Railway](https://railway.app) (MySQL)
- [Aiven](https://aiven.io) (MySQL)

**DATABASE_URL format:**
```
mysql://username:password@hostname:3306/krishify
```

For PlanetScale (uses SSL):
```
mysql://username:password@hostname/krishify?ssl=true
```

### Step 4: Deploy
```bash
git push origin main
```
Vercel auto-deploys on push.

## 📋 Architecture

- **Next.js 13.5** (Pages Router)
- **MySQL** via `mysql2/promise`
- **bcrypt** password hashing
- **Session-based auth** (cookie: `krishify_session`)
- **Razorpay TEST** payments
- **AI_PROVIDER=TEST** quality assessment
- **Tailwind CSS 3**

## 🔄 Business Flow

```
Farmer creates lot (5000 kg, ₹2500/quintal)
    ↓
Submit for physical inspection
    ↓
Inspector approves (Grade A, moisture 11.5%)
    ↓
AI TEST assessment runs automatically
    ↓
Lot goes to auction
    ↓
Buyers bid in ₹/quintal (server calculates total)
    ↓
Highest bid wins entire lot
    ↓
Order created (50q × ₹2625 = ₹131,250)
    ↓
Razorpay TEST payment
    ↓
Delivery tracking (CREATED→DELIVERED)
    ↓
Buyer reviews
```
