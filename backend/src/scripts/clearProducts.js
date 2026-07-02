require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const Product  = require('../models/Product');
  const Cart     = require('../models/Cart');
  const Wishlist = require('../models/Wishlist');

  const [pCount] = await Promise.all([
    Product.countDocuments(),
  ]);

  console.log(`Found ${pCount} product(s) deleting...`);

  await Promise.all([
    Product.deleteMany({}),
    // Empty all carts and wishlists since their items reference products
    Cart.updateMany({}, { $set: { items: [] } }),
    Wishlist.updateMany({}, { $set: { items: [] } }),
  ]);

  console.log('Done. All products deleted, carts and wishlists cleared.');
  await mongoose.disconnect();
};

run().catch(err => { console.error(err); process.exit(1); });
