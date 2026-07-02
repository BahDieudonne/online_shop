// models/User.js CHANCELOR STORE
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  region: { type: String, required: true },
  country: { type: String, default: 'Cameroon' },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const loyaltySchema = new mongoose.Schema({
  points: { type: Number, default: 0 },
  tier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Diamond'], default: 'Bronze' },
  totalEarned: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: {
    type: String, required: true, unique: true,
    lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
  },
  phone: { type: String, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  avatar: { type: String, default: '' },
  role: {
    type: String,
    enum: ['customer', 'staff', 'manager', 'admin', 'super_admin'],
    default: 'customer',
  },
  addresses: [addressSchema],
  loyalty: { type: loyaltySchema, default: () => ({}) },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralCount: { type: Number, default: 0 },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, select: false },
  emailVerificationExpires: { type: Date, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, select: false },
  refreshTokens: [{ type: String, select: false }],
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true },
    orderUpdates: { type: Boolean, default: true },
    promotions: { type: Boolean, default: true },
    newArrivals: { type: Boolean, default: false },
  },
  isActive: { type: Boolean, default: true },
  isBanned: { type: Boolean, default: false },
  banReason: { type: String },
  lastLoginAt: { type: Date },
  lastLoginIP: { type: String },
  permissions: [{ type: String }],
  department: { type: String },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

userSchema.virtual('fullName').get(function () { return `${this.firstName} ${this.lastName}`; });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.pre('save', function (next) {
  if (!this.referralCode) {
    this.referralCode = `CHN-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateLoyaltyTier = function () {
  const p = this.loyalty.points;
  if (p >= 10000) this.loyalty.tier = 'Diamond';
  else if (p >= 5000) this.loyalty.tier = 'Gold';
  else if (p >= 1000) this.loyalty.tier = 'Silver';
  else this.loyalty.tier = 'Bronze';
};

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
