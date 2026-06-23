// seedData.js — CHANCELOR STORE
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

const categories = [
  { name: 'Electronics', slug: 'electronics', icon: '💻', order: 1, isFeatured: true },
  { name: 'Smartphones', slug: 'smartphones', icon: '📱', order: 2, parent: null },
  { name: 'Fashion', slug: 'fashion', icon: '👕', order: 3, isFeatured: true },
  { name: 'Home & Kitchen', slug: 'home-kitchen', icon: '🏠', order: 4, isFeatured: true },
  { name: 'Beauty & Health', slug: 'beauty-health', icon: '💄', order: 5, isFeatured: true },
  { name: 'Sports', slug: 'sports', icon: '⚽', order: 6 },
  { name: 'Books', slug: 'books', icon: '📚', order: 7 },
  { name: 'Baby & Kids', slug: 'baby-kids', icon: '🧸', order: 8 },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chancelor-store');
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}), Category.deleteMany({}),
    Product.deleteMany({}), Coupon.deleteMany({}),
  ]);

  // Create admin
  const admin = await User.create({
    firstName: 'CHANCELOR',
    lastName: 'Admin',
    email: 'admin@chancelorstore.cm',
    password: 'Admin@123!',
    role: 'super_admin',
    isEmailVerified: true,
    phone: '+237674962803',
  });
  console.log('Admin created:', admin.email);

  // Create sample customer
  await User.create({
    firstName: 'Jean',
    lastName: 'Mballa',
    email: 'customer@example.com',
    password: 'Customer@123!',
    role: 'customer',
    isEmailVerified: true,
    phone: '+237655000001',
  });

  // Create categories
  const createdCategories = await Category.insertMany(categories);
  console.log(`Created ${createdCategories.length} categories`);

  const elec = createdCategories.find(c => c.slug === 'electronics');
  const fashion = createdCategories.find(c => c.slug === 'fashion');
  const home = createdCategories.find(c => c.slug === 'home-kitchen');

  // Sample products
  const products = [
    {
      name: 'Samsung Galaxy A54 5G',
      slug: 'samsung-galaxy-a54-5g',
      shortDescription: 'Flagship-quality experience at a mid-range price. 64MP camera, 5000mAh battery.',
      description: '<p>The Samsung Galaxy A54 5G brings premium features to the mid-range market. Featuring a stunning 6.4-inch Super AMOLED display, a versatile 64MP triple camera system, and 5G connectivity.</p>',
      category: elec._id,
      brand: 'Samsung',
      price: 250000,
      discountPrice: 219000,
      stock: 45,
      status: 'published',
      condition: 'new',
      isFeatured: true,
      isNewArrival: true,
      images: [{ url: 'https://via.placeholder.com/600x600?text=Galaxy+A54', order: 0, isThumbnail: true }],
      specifications: [
        { key: 'Display', value: '6.4-inch Super AMOLED' },
        { key: 'Camera', value: '64MP + 12MP + 5MP' },
        { key: 'Battery', value: '5000mAh' },
        { key: 'RAM', value: '8GB' },
        { key: 'Storage', value: '256GB' },
        { key: 'OS', value: 'Android 13' },
      ],
      tags: ['samsung', 'smartphone', '5g', 'android'],
      createdBy: admin._id,
    },
    {
      name: 'Tecno Spark 20 Pro',
      slug: 'tecno-spark-20-pro',
      shortDescription: 'Africa-first smartphone. 108MP camera, 6.78-inch display, 5000mAh battery.',
      description: '<p>The Tecno Spark 20 Pro is built for Africa — affordable, powerful, and ready for mobile money. Perfect for business and entertainment.</p>',
      category: elec._id,
      brand: 'Tecno',
      price: 120000,
      discountPrice: 99000,
      stock: 80,
      status: 'published',
      condition: 'new',
      isBestSeller: true,
      images: [{ url: 'https://via.placeholder.com/600x600?text=Tecno+Spark+20', order: 0, isThumbnail: true }],
      tags: ['tecno', 'smartphone', 'android', 'affordable'],
      createdBy: admin._id,
    },
    {
      name: 'Men\'s Casual Ankara Shirt',
      slug: 'mens-casual-ankara-shirt',
      shortDescription: 'Premium Ankara fabric. Vibrant traditional Cameroonian patterns. Perfect for any occasion.',
      description: '<p>Celebrate Cameroonian culture with our handcrafted Ankara shirts. Made from 100% premium cotton fabric with traditional patterns.</p>',
      category: fashion._id,
      brand: 'CHANCELOR Fashion',
      price: 15000,
      discountPrice: 12000,
      stock: 120,
      status: 'published',
      condition: 'new',
      isNewArrival: true,
      hasVariants: true,
      variantAttributes: ['size', 'color'],
      variants: [
        { name: 'S - Blue', attributes: { size: 'S', color: 'Blue' }, sku: 'ANKA-S-BLU', price: 12000, stock: 20, images: [] },
        { name: 'M - Blue', attributes: { size: 'M', color: 'Blue' }, sku: 'ANKA-M-BLU', price: 12000, stock: 30, images: [] },
        { name: 'L - Blue', attributes: { size: 'L', color: 'Blue' }, sku: 'ANKA-L-BLU', price: 12000, stock: 25, images: [] },
        { name: 'XL - Red', attributes: { size: 'XL', color: 'Red' }, sku: 'ANKA-XL-RED', price: 13000, stock: 15, images: [] },
      ],
      images: [{ url: 'https://via.placeholder.com/600x600?text=Ankara+Shirt', order: 0, isThumbnail: true }],
      tags: ['ankara', 'fashion', 'shirt', 'cameroon', 'traditional'],
      createdBy: admin._id,
    },
    {
      name: 'HP 250 G9 Laptop',
      slug: 'hp-250-g9-laptop',
      shortDescription: 'Intel Core i5 12th Gen, 8GB RAM, 512GB SSD. Business & student powerhouse.',
      description: '<p>The HP 250 G9 is the perfect laptop for Cameroonian students and professionals. Reliable, fast, and built for productivity.</p>',
      category: elec._id,
      brand: 'HP',
      price: 450000,
      discountPrice: 399000,
      stock: 18,
      status: 'published',
      condition: 'new',
      isFeatured: true,
      images: [{ url: 'https://via.placeholder.com/600x600?text=HP+250+G9', order: 0, isThumbnail: true }],
      tags: ['laptop', 'hp', 'computer', 'student', 'business'],
      createdBy: admin._id,
    },
    {
      name: 'LG 32" Full HD Monitor',
      slug: 'lg-32-full-hd-monitor',
      shortDescription: '32-inch IPS panel, 75Hz refresh rate, HDMI + VGA ports.',
      description: '<p>Crystal-clear 32-inch Full HD IPS display with flicker-safe technology and blue light filter.</p>',
      category: elec._id,
      brand: 'LG',
      price: 180000,
      stock: 12,
      status: 'published',
      condition: 'new',
      images: [{ url: 'https://via.placeholder.com/600x600?text=LG+Monitor', order: 0, isThumbnail: true }],
      tags: ['monitor', 'lg', 'display', 'computer'],
      createdBy: admin._id,
    },
    {
      name: 'Nescafe Classic Coffee 200g',
      slug: 'nescafe-classic-200g',
      shortDescription: 'Rich, smooth instant coffee. Start your day the Cameroonian way.',
      description: '<p>Nescafé Classic instant coffee. Full-bodied taste with a rich aroma. Made from carefully selected coffee beans.</p>',
      category: home._id,
      brand: 'Nescafé',
      price: 4500,
      discountPrice: 3800,
      stock: 200,
      status: 'published',
      condition: 'new',
      isBestSeller: true,
      isFlashSale: true,
      flashSalePrice: 3200,
      flashSaleEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      images: [{ url: 'https://via.placeholder.com/600x600?text=Nescafe', order: 0, isThumbnail: true }],
      tags: ['coffee', 'nescafe', 'beverage', 'kitchen'],
      createdBy: admin._id,
    },
  ];

  const createdProducts = await Product.insertMany(products);
  console.log(`Created ${createdProducts.length} products`);

  // Coupons
  await Coupon.insertMany([
    {
      code: 'WELCOME20',
      description: '20% off your first order',
      type: 'percentage',
      value: 20,
      minimumOrderAmount: 10000,
      maximumDiscount: 50000,
      usageLimit: 1000,
      usagePerUser: 1,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdBy: admin._id,
    },
    {
      code: 'CHANCELOR10',
      description: '10% off all orders',
      type: 'percentage',
      value: 10,
      minimumOrderAmount: 5000,
      usageLimit: null,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdBy: admin._id,
    },
    {
      code: 'FREESHIP',
      description: 'Free shipping on all orders',
      type: 'free_shipping',
      value: 0,
      minimumOrderAmount: 20000,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdBy: admin._id,
    },
  ]);

  console.log('Coupons created');
  console.log('\n✅ CHANCELOR STORE seeded successfully!');
  console.log('Admin: admin@chancelorstore.cm / Admin@123!');
  console.log('Customer: customer@example.com / Customer@123!');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
