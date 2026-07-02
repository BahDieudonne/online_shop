import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  TruckIcon,
  ArrowUturnLeftIcon,
  CreditCardIcon,
  UserCircleIcon,
  ShoppingBagIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const WhatsAppSVG = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const TOPICS = [
  {
    icon: ShoppingBagIcon,
    color: 'bg-blue-100 text-blue-600',
    title: 'Orders',
    links: [
      { label: 'How to place an order', anchor: 'place-order' },
      { label: 'How to track my order', to: '/track-order' },
      { label: 'Can I cancel my order?', anchor: 'cancel-order' },
      { label: 'Pre-orders explained', anchor: 'preorder' },
    ],
  },
  {
    icon: CreditCardIcon,
    color: 'bg-green-100 text-green-600',
    title: 'Payments',
    links: [
      { label: 'How do I pay?', anchor: 'payment' },
      { label: 'Accepted payment methods', anchor: 'payment-methods' },
      { label: 'Payment confirmation', anchor: 'payment-confirm' },
    ],
  },
  {
    icon: TruckIcon,
    color: 'bg-amber-100 text-amber-600',
    title: 'Shipping & Delivery',
    links: [
      { label: 'Delivery areas', anchor: 'delivery-areas' },
      { label: 'Shipping fees', anchor: 'shipping-fees' },
      { label: 'Delivery times', anchor: 'delivery-time' },
      { label: 'Full shipping policy', to: '/shipping-policy' },
    ],
  },
  {
    icon: ArrowUturnLeftIcon,
    color: 'bg-red-100 text-red-600',
    title: 'Returns & Refunds',
    links: [
      { label: 'Return policy', to: '/return-policy' },
      { label: 'How to return an item', anchor: 'returns' },
      { label: 'Refund timeline', anchor: 'refund-time' },
    ],
  },
  {
    icon: UserCircleIcon,
    color: 'bg-purple-100 text-purple-600',
    title: 'My Account',
    links: [
      { label: 'Create an account', to: '/register' },
      { label: 'Forgot password', to: '/forgot-password' },
      { label: 'View my orders', to: '/account/orders' },
      { label: 'Update my profile', to: '/account/profile' },
    ],
  },
];

const FAQS = [
  {
    id: 'place-order',
    q: 'How do I place an order?',
    a: 'Browse our shop, add items to your cart, then go to checkout. Fill in your delivery details and click "Place Order". After placing your order, you will receive instructions to contact us and arrange payment.',
  },
  {
    id: 'payment',
    q: 'How does payment work?',
    a: 'We do not process payments online. After you place your order, contact us via WhatsApp, phone, or email to arrange payment. We accept MTN Mobile Money, Orange Money, and bank transfer. Your order is confirmed once payment is received.',
  },
  {
    id: 'payment-methods',
    q: 'What payment methods do you accept?',
    a: 'We accept MTN Mobile Money, Orange Money, and bank transfer (UBA, Afriland First Bank). Contact us after placing your order and we will send you the payment details.',
  },
  {
    id: 'payment-confirm',
    q: 'How will I know my payment was confirmed?',
    a: 'Once we receive your payment, we will update your order status to "Confirmed" and you will receive a notification in your account. You can check your order status anytime at My Account > My Orders.',
  },
  {
    id: 'cancel-order',
    q: 'Can I cancel my order?',
    a: 'You can cancel your order any time before it has been shipped. Go to My Account > My Orders, open the order and click "Cancel". If the order has already shipped, contact us immediately and we will do our best to help.',
  },
  {
    id: 'preorder',
    q: 'What is a pre-order?',
    a: 'If a product is temporarily out of stock, you can still place a pre-order. Your order is registered and we will notify you when the item is available and ready to ship. Payment is arranged the same way as a regular order.',
  },
  {
    id: 'delivery-areas',
    q: 'Where do you deliver?',
    a: 'We deliver across all 10 regions of Cameroon, including Douala, Yaounde, Bafoussam, Bamenda, Garoua, Maroua, Bertoua, Ebolowa, Ngaoundere, and Buea. Contact us if you are in a remote area.',
  },
  {
    id: 'shipping-fees',
    q: 'How much does shipping cost?',
    a: 'Shipping is free for orders over 50,000 FCFA. For orders below that, a flat shipping fee of 2,000 FCFA applies. The exact fee is shown at checkout before you place your order.',
  },
  {
    id: 'delivery-time',
    q: 'How long does delivery take?',
    a: 'Deliveries within Douala and Yaounde typically take 1 to 2 business days after payment confirmation. Other regions take 2 to 5 business days depending on location.',
  },
  {
    id: 'returns',
    q: 'How do I return an item?',
    a: 'Contact us within 7 days of receiving your order via WhatsApp or email with photos of the item. We will guide you through the return process. Items must be unused and in original packaging.',
  },
  {
    id: 'refund-time',
    q: 'How long do refunds take?',
    a: 'Once a return is approved, refunds are processed within 3 to 5 business days via the same payment method you used (MTN MoMo, Orange Money, or bank transfer).',
  },
];

const FAQItem = ({ faq }) => {
  const [open, setOpen] = useState(false);
  return (
    <div id={faq.id} className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-navy-800 text-sm pr-4">{faq.q}</span>
        <ChevronDownIcon className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 bg-white">
          {faq.a}
        </div>
      )}
    </div>
  );
};

const HelpPage = () => {
  const [search, setSearch] = useState('');

  const filtered = search.trim().length > 1
    ? FAQS.filter(f =>
        f.q.toLowerCase().includes(search.toLowerCase()) ||
        f.a.toLowerCase().includes(search.toLowerCase())
      )
    : FAQS;

  return (
    <>
      <Helmet><title>Help Center CHANCELOR STORE</title></Helmet>

      {/* Hero */}
      <div className="bg-gradient-to-br from-navy-800 to-purple-800 text-white py-14 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">Help Center</h1>
          <p className="text-navy-200 mb-8">Find answers to the most common questions, or contact us directly.</p>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your question..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">

        {/* Browse by topic */}
        {!search.trim() && (
          <div className="mb-12">
            <h2 className="font-display text-xl font-bold text-navy-900 mb-6">Browse by Topic</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TOPICS.map(({ icon: Icon, color, title, links }) => (
                <div key={title} className="card p-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-navy-800 mb-3">{title}</h3>
                  <ul className="space-y-1.5">
                    {links.map(({ label, to, anchor }) => (
                      <li key={label}>
                        {to ? (
                          <Link to={to} className="text-sm text-navy-600 hover:text-navy-800 hover:underline">
                            {label}
                          </Link>
                        ) : (
                          <a href={`#${anchor}`} onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
                            document.getElementById(anchor)?.querySelector('button')?.click();
                          }} className="text-sm text-navy-600 hover:text-navy-800 hover:underline">
                            {label}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ list */}
        <div className="mb-12">
          <h2 className="font-display text-xl font-bold text-navy-900 mb-6">
            {search.trim() ? `Results for "${search}"` : 'Frequently Asked Questions'}
          </h2>
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <MagnifyingGlassIcon className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-500">No results found for "{search}"</p>
              <p className="text-sm mt-1">Try different keywords or contact us directly below.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((faq) => <FAQItem key={faq.id} faq={faq} />)}
            </div>
          )}
        </div>

        {/* Contact us */}
        <div className="bg-gradient-to-br from-navy-50 to-purple-50 border border-navy-100 rounded-2xl p-8 text-center">
          <h2 className="font-display text-xl font-bold text-navy-900 mb-2">Still need help?</h2>
          <p className="text-gray-500 text-sm mb-6">Our team is available Monday to Saturday, 8am to 8pm.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://wa.me/237674962803?text=Hello%20CHANCELOR%20STORE%2C%20I%20need%20help%20with..."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              <WhatsAppSVG /> Chat on WhatsApp
            </a>
            <a
              href="tel:+237674962803"
              className="inline-flex items-center gap-2 bg-navy-700 hover:bg-navy-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              <PhoneIcon className="w-4 h-4" /> +237 674 962 803
            </a>
            <a
              href="mailto:contact@chancelorstore.cm"
              className="inline-flex items-center gap-2 border-2 border-navy-200 hover:border-navy-400 text-navy-700 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            >
              <EnvelopeIcon className="w-4 h-4" /> Send Email
            </a>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            You can also visit our <Link to="/faq" className="text-navy-600 hover:underline">full FAQ page</Link> or{' '}
            <Link to="/contact" className="text-navy-600 hover:underline">contact page</Link>.
          </p>
        </div>
      </div>
    </>
  );
};

export default HelpPage;
