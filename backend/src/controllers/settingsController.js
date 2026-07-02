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
};

// GET /settings/:key — public
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

// PUT /settings/:key — admin only
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
