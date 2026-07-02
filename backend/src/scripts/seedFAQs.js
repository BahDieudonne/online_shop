require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const ContentItem = require('../models/ContentItem');

  await ContentItem.deleteMany({ type: 'faq' });
  console.log('Cleared existing FAQs');

  const faqs = [
    // ── Orders & Delivery ──────────────────────────────────────────────────
    {
      type: 'faq', category: 'Orders & Delivery', order: 1, isActive: true,
      question: 'How long does delivery take?',
      answer: 'Standard delivery takes 2–5 business days depending on your location in Cameroon. Deliveries to Douala and Yaoundé are generally faster (1–2 days). Remote areas may take up to 7 business days.',
    },
    {
      type: 'faq', category: 'Orders & Delivery', order: 2, isActive: true,
      question: 'How can I track my order?',
      answer: 'Once your order is shipped, you will receive a confirmation message with a tracking number via SMS or WhatsApp. You can also track your order by visiting My Account → My Orders and clicking on the order.',
    },
    {
      type: 'faq', category: 'Orders & Delivery', order: 3, isActive: true,
      question: 'Do you deliver to all regions of Cameroon?',
      answer: 'Yes! We deliver to all 10 regions of Cameroon, including Douala, Yaoundé, Bafoussam, Garoua, Maroua, Bamenda, Buea, Ngaoundéré, Bertoua, and Ebolowa. Delivery fees vary by location.',
    },
    {
      type: 'faq', category: 'Orders & Delivery', order: 4, isActive: true,
      question: 'Can I change or cancel my order after placing it?',
      answer: 'You can cancel or modify your order within 2 hours of placing it by contacting us on WhatsApp at +237 674 962 803. After this window, the order may already be in preparation and cannot be changed.',
    },
    {
      type: 'faq', category: 'Orders & Delivery', order: 5, isActive: true,
      question: 'Is there a minimum order amount?',
      answer: 'There is no minimum order amount. However, orders above 50,000 FCFA qualify for free delivery across Cameroon. For orders below this threshold, a delivery fee applies based on your location.',
    },

    // ── Payments ──────────────────────────────────────────────────────────
    {
      type: 'faq', category: 'Payments', order: 1, isActive: true,
      question: 'What payment methods are accepted?',
      answer: 'We accept MTN Mobile Money (MoMo), Orange Money, Cash on Delivery (pay when your package arrives), and Bank Transfer. All mobile money payments are instant and secure.',
    },
    {
      type: 'faq', category: 'Payments', order: 2, isActive: true,
      question: 'Is it safe to pay online on CHANCELOR STORE?',
      answer: 'Absolutely. All transactions are encrypted and processed securely. We never store your payment credentials. MTN MoMo and Orange Money payments require your personal PIN, which only you know.',
    },
    {
      type: 'faq', category: 'Payments', order: 3, isActive: true,
      question: 'Can I pay on delivery (cash)?',
      answer: 'Yes, Cash on Delivery is available for most locations in Cameroon. You pay the courier in cash when they bring your package. Please have the exact amount ready.',
    },
    {
      type: 'faq', category: 'Payments', order: 4, isActive: true,
      question: 'What should I do if my payment fails?',
      answer: 'If your payment fails, please check that your Mobile Money account has sufficient funds and that you have entered the correct number. Try again or contact us on WhatsApp (+237 674 962 803) and we will assist you immediately.',
    },

    // ── Returns & Refunds ─────────────────────────────────────────────────
    {
      type: 'faq', category: 'Returns & Refunds', order: 1, isActive: true,
      question: 'Can I return a product?',
      answer: 'Yes. You can return most products within 7 days of delivery, provided they are in original condition, unused, and in their original packaging. Some items (perishables, personal care products) cannot be returned for hygiene reasons.',
    },
    {
      type: 'faq', category: 'Returns & Refunds', order: 2, isActive: true,
      question: 'How do I initiate a return?',
      answer: 'Contact us on WhatsApp (+237 674 962 803) or by email at support@chancelorstore.cm within 7 days of receiving your order. Describe the issue and attach photos if the product is defective. We will arrange a pickup or ask you to drop it off at a collection point.',
    },
    {
      type: 'faq', category: 'Returns & Refunds', order: 3, isActive: true,
      question: 'How long does a refund take?',
      answer: 'Once we receive and inspect the returned product, refunds are processed within 3–5 business days. Mobile Money refunds are instant once approved. Bank transfers may take 2–3 additional business days.',
    },
    {
      type: 'faq', category: 'Returns & Refunds', order: 4, isActive: true,
      question: 'What if I receive a damaged or wrong product?',
      answer: 'If you receive a damaged or incorrect item, contact us immediately on WhatsApp with photos of the product. We will send a replacement at no additional cost or issue a full refund — your choice.',
    },

    // ── Account ───────────────────────────────────────────────────────────
    {
      type: 'faq', category: 'Account', order: 1, isActive: true,
      question: 'How do I create an account?',
      answer: 'Click "Sign Up" at the top of the page. Fill in your name, email address, phone number, and choose a password. You will receive a confirmation email to verify your account. You can also shop as a guest without creating an account.',
    },
    {
      type: 'faq', category: 'Account', order: 2, isActive: true,
      question: 'I forgot my password. How do I reset it?',
      answer: 'Click "Sign In" then "Forgot Password?". Enter your email address and we will send you a reset link. Check your inbox (and spam folder). The link is valid for 1 hour.',
    },
    {
      type: 'faq', category: 'Account', order: 3, isActive: true,
      question: 'Can I shop without creating an account?',
      answer: 'Yes, you can browse and add items to your cart without an account. However, creating an account lets you track orders, save your wishlist, store delivery addresses, and receive exclusive offers.',
    },

    // ── Products ──────────────────────────────────────────────────────────
    {
      type: 'faq', category: 'Products', order: 1, isActive: true,
      question: 'Are the products on CHANCELOR STORE genuine?',
      answer: 'Yes, all products sold on CHANCELOR STORE are 100% authentic. We source directly from authorized distributors and verified suppliers. If you ever receive a counterfeit item, we will refund you in full.',
    },
    {
      type: 'faq', category: 'Products', order: 2, isActive: true,
      question: 'What if a product I want is out of stock?',
      answer: 'You can click "Notify Me" on any out-of-stock product page to receive an alert when it becomes available. You can also contact us on WhatsApp and we may be able to source it for you.',
    },
    {
      type: 'faq', category: 'Products', order: 3, isActive: true,
      question: 'Do products come with a warranty?',
      answer: 'Electronics and appliances come with the manufacturer\'s warranty (typically 6–12 months). Fashion, accessories, and consumables generally do not carry a warranty but are covered by our 7-day return policy.',
    },
  ];

  await ContentItem.insertMany(faqs);
  console.log(`Seeded ${faqs.length} FAQs across 5 categories.`);
  await mongoose.disconnect();
};

run().catch(err => { console.error(err); process.exit(1); });
