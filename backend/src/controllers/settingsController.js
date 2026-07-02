const Settings = require('../models/Settings');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const DEFAULTS = {
  general: {
    siteName: 'CHANCELOR STORE',
    siteDescription: 'Your trusted online store in Cameroon',
    siteEmail: 'info@chancelor.cm',
    sitePhone: '+237 674 962 803',
    siteAddress: 'Cameroon',
    currency: 'XAF',
    language: 'fr',
    timezone: 'Africa/Douala',
    maintenanceMode: false,
  },
  shipping: {
    freeShippingThreshold: 50000,
    defaultShippingCost: 2000,
    enablePickup: true,
    pickupAddress: 'Douala, Cameroon',
    estimatedDelivery: '2-5 jours ouvrables',
  },
  payment: {
    mtnMomoEnabled: true,
    mtnMomoNumber: '+237 674 962 803',
    orangeMoneyEnabled: true,
    orangeMoneyNumber: '',
    cashOnDeliveryEnabled: true,
    bankTransferEnabled: true,
    stripeEnabled: false,
    stripePublicKey: '',
  },
  notifications: {
    orderConfirmation: true,
    orderShipped: true,
    orderDelivered: true,
    lowStockAlert: true,
    lowStockThreshold: 5,
    newCustomerAlert: true,
    newOrderAlert: true,
    adminEmail: 'admin@chancelor.cm',
  },
  'page-about': {
    story: {
      heading: 'Our Story',
      body: "CHANCELOR STORE was born from a simple vision: make online shopping accessible, reliable, and enjoyable for everyone in Cameroon. Founded with passion, our store is committed to offering the best products at competitive prices.",
    },
    mission: {
      heading: 'Our Mission',
      body: 'Offer quality products at competitive prices, with fast delivery across Cameroon and exceptional customer service available 7 days a week.',
    },
    vision: {
      heading: 'Our Vision',
      body: 'Become the leading e-commerce platform in Central Africa, connecting Cameroonians with the best products in the world.',
    },
    stats: [
      { label: 'Happy Customers',      value: '5,000+' },
      { label: 'Products Available',   value: '1,000+' },
      { label: 'Cities Served',        value: '10+' },
      { label: 'Years of Experience',  value: '2+' },
    ],
    values: [
      { icon: 'users',    title: 'Trust',    desc: 'We build lasting relationships with our customers built on honesty and transparency.' },
      { icon: 'bolt',     title: 'Speed',    desc: 'Express delivery across Cameroon in the shortest possible time.' },
      { icon: 'sparkles', title: 'Quality',  desc: 'Only the best products, carefully selected for you.' },
      { icon: 'shield',   title: 'Security', desc: 'Secure payments, protected data, and guaranteed returns.' },
    ],
  },
  'page-contact': {
    phone: '+237 674 962 803',
    email: 'support@chancelorstore.cm',
    address: 'Douala, Cameroon',
    hours: 'Mon – Sat: 8:00 AM – 8:00 PM',
    whatsapp: '237674962803',
    mapEmbed: '',
    social: { facebook: '', instagram: '', twitter: '' },
  },
};

// GET /settings/:key public
exports.getSettings = async (req, res, next) => {
  try {
    const { key } = req.params;
    const defaults = DEFAULTS[key] || {};

    const doc = await Settings.findOne({ key }).lean();
    const merged = { ...defaults, ...(doc?.value || {}) };

    return successResponse(res, merged, `Settings for ${key}`);
  } catch (err) {
    next(err);
  }
};

// PUT /settings/:key admin only
exports.updateSettings = async (req, res, next) => {
  try {
    const { key } = req.params;
    const value = req.body;

    if (!value || typeof value !== 'object') {
      return errorResponse(res, 'Invalid settings payload', 400);
    }

    const doc = await Settings.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true, new: true, runValidators: true }
    );

    return successResponse(res, doc.value, 'Settings updated successfully');
  } catch (err) {
    next(err);
  }
};
