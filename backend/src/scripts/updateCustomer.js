require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const User = require('../models/User');

  // Find existing customer by old email or new email
  let customer = await User.findOne({ email: 'customer@example.com' });
  if (!customer) {
    customer = await User.findOne({ email: 'bahdieudonne49@gmail.com' });
  }

  if (!customer) {
    console.log('No customer found with customer@example.com or bahdieudonne49@gmail.com');
    console.log('Run "npm run seed" in the backend to create the sample customer.');
    await mongoose.disconnect();
    return;
  }

  const hash = await bcrypt.hash('dieudonne231', 10);

  await User.updateOne(
    { _id: customer._id },
    {
      $set: {
        firstName: 'Bah',
        lastName: 'Dieudonne',
        email: 'bahdieudonne49@gmail.com',
        password: hash,
      },
    }
  );

  console.log(`Customer updated: ${customer.email} → bahdieudonne49@gmail.com (Bah Dieudonne)`);
  await mongoose.disconnect();
};

run().catch(err => { console.error(err); process.exit(1); });
