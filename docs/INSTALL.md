# CHANCELOR STORE Installation Guide

## Prerequisites
- Node.js 20+
- MongoDB 7.0+
- npm 10+ or pnpm 9+
- Git

## Local Development Setup

### 1. Clone and install
```bash
git clone https://github.com/your-org/chancelor-store.git
cd chancelor-store
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values (MongoDB URI, JWT secrets, etc.)
npm run dev
# Backend runs on http://localhost:5000
```

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
# Frontend runs on http://localhost:5173
```

### 4. Seed database
```bash
cd backend
npm run seed
# Creates admin user: admin@chancelorstore.cm / Admin@123
# Creates sample categories, products, coupons
```

## Environment Variables

### Backend (.env)
See `backend/.env.example` for all required variables.

**Required for basic operation:**
- `MONGODB_URI` MongoDB connection string
- `JWT_ACCESS_SECRET` Min 32 random chars
- `JWT_REFRESH_SECRET` Min 32 random chars (different from above)

**Required for payments:**
- Stripe: `STRIPE_SECRET_KEY`
- MTN MoMo: `MTN_MOMO_API_USER`, `MTN_MOMO_API_KEY`, `MTN_MOMO_SUBSCRIPTION_KEY`
- Orange Money: `ORANGE_MONEY_CLIENT_ID`, `ORANGE_MONEY_CLIENT_SECRET`

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=CHANCELOR STORE
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_PAYPAL_CLIENT_ID=...
VITE_VAPID_PUBLIC_KEY=...
```

## Docker Deployment

```bash
# Copy env files
cp backend/.env.example backend/.env
# Edit backend/.env

# Build and start all services
cd docker
docker-compose up -d

# Services:
# MongoDB: localhost:27017
# Backend API: localhost:5000
# Frontend: localhost:3000
# Nginx (reverse proxy): localhost:80 / :443
```

## Production Deployment

### SSL Certificate (Let's Encrypt)
```bash
apt install certbot
certbot certonly --standalone -d chancelorstore.cm -d www.chancelorstore.cm
# Certificates saved to /etc/letsencrypt/live/chancelorstore.cm/
cp /etc/letsencrypt/live/chancelorstore.cm/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/chancelorstore.cm/privkey.pem nginx/ssl/
```

### PM2 (without Docker)
```bash
npm install -g pm2
cd backend
pm2 start server.js --name chancelor-backend --max-memory-restart 512M
pm2 save
pm2 startup
```

## Admin Dashboard Access
After seeding, access the admin panel at:
`http://localhost:5173/admin`

Default credentials:
- Email: `admin@chancelorstore.cm`
- Password: `Admin@123!`

**Change this immediately after first login.**
