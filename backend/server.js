// server.js — CHANCELOR STORE Backend
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const mongoose = require('mongoose');

const { errorHandler } = require('./src/middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./src/middleware/rateLimiter');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Sanitize MongoDB queries
app.use(mongoSanitize());

// Compress responses
app.use(compression());

// Global rate limit
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/products', require('./src/routes/product.routes'));
app.use('/api/categories', require('./src/routes/categories'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/cart', require('./src/routes/cart'));
app.use('/api/wishlist', require('./src/routes/wishlist'));
app.use('/api/reviews', require('./src/routes/reviews'));
app.use('/api/coupons', require('./src/routes/coupons'));
app.use('/api/payments', require('./src/routes/payments'));
app.use('/api/notifications', require('./src/routes/notifications'));
app.use('/api/analytics', require('./src/routes/analytics'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/service-reviews', require('./src/routes/serviceReviews'));

// Health check
app.get('/health', (req, res) => res.json({
  status: 'healthy', timestamp: new Date(), env: process.env.NODE_ENV,
}));

// 404
app.use((req, res) => res.status(404).json({ message: `Route ${req.url} not found` }));

// Error handler
app.use(errorHandler);

// DB + server start — skipped when Vercel imports this as a serverless handler
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 10, serverSelectionTimeoutMS: 5000,
  }).then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 CHANCELOR STORE API running on port ${PORT}`));
  }).catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
} else {
  // Serverless: establish DB connection at cold start
  mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 10, serverSelectionTimeoutMS: 5000,
  }).catch(err => console.error('❌ MongoDB connection failed:', err.message));
}

module.exports = app;
