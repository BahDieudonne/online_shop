import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import orderService from '../services/orderService';
import { formatCurrency } from '../utils/formatters';
import api from '../services/api';

const PhoneSVG = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const EmailSVG = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const WhatsAppSVG = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const STEPS_NEXT = [
  { icon: CheckCircleSolid, label: 'Order placed', desc: 'We received your order', done: true },
  { icon: PhoneSVG,         label: 'Contact & pay', desc: 'Reach us to arrange payment', done: false },
  { icon: CheckCircleIcon,  label: 'Confirmed',    desc: 'Admin confirms your payment', done: false },
  { icon: TruckIcon,        label: 'Shipped',       desc: 'Your order is on its way', done: false },
];

const OrderConfirmationPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [contact, setContact] = useState({ phone: '+237 674 962 803', whatsapp: '+237 674 962 803', email: 'contact@chancelorstore.cm' });

  useEffect(() => {
    if (id) {
      orderService.getOrder(id).then((r) => setOrder(r.data?.data)).catch(() => {});
    }
    // Fetch contact settings
    api.get('/settings/page-contact').then((r) => {
      const d = r.data?.data;
      if (d) setContact({ phone: d.phone || contact.phone, whatsapp: d.whatsapp || contact.whatsapp, email: d.email || contact.email });
    }).catch(() => {});
  }, [id]);

  const waNumber = contact.whatsapp?.replace(/[^0-9]/g, '');
  const waMessage = order
    ? encodeURIComponent(`Hello CHANCELOR STORE, I want to arrange payment for my order #${order.orderNumber} Total: ${order.pricing?.total?.toLocaleString()} XAF`)
    : encodeURIComponent('Hello CHANCELOR STORE, I want to arrange payment for my order.');

  return (
    <>
      <Helmet><title>Order Placed CHANCELOR STORE</title></Helmet>
      <div className="container mx-auto px-4 py-10 max-w-2xl">

        {/* Success banner */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleSolid className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="font-display text-3xl font-bold text-navy-900 mb-2">
            {order?.isPreOrder ? 'Pre-order Placed!' : 'Order Placed!'}
          </h1>
          <p className="text-gray-500">
            {order?.isPreOrder
              ? 'Your pre-order has been recorded. Contact us to secure your item and arrange payment.'
              : 'Your order is confirmed. Now contact us to arrange payment and we\'ll prepare it right away.'}
          </p>
          {order && (
            <p className="mt-2 text-sm font-mono font-bold text-navy-600 bg-navy-50 inline-block px-3 py-1 rounded-full">
              Order #{order.orderNumber}
            </p>
          )}
        </div>

        {/* PAYMENT INSTRUCTIONS prominent */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-2xl p-6 mb-6 shadow-lg">
          <h2 className="font-display text-xl font-bold mb-1">Contact us to pay</h2>
          <p className="text-green-100 text-sm mb-5">
            Choose any method below. We accept MTN MoMo, Orange Money, and bank transfer.
          </p>
          <div className="space-y-3">
            <a
              href={`https://wa.me/${waNumber}?text=${waMessage}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 bg-white/20 hover:bg-white/30 transition-colors rounded-xl px-4 py-3 font-semibold"
            >
              <WhatsAppSVG />
              <span>WhatsApp {contact.whatsapp}</span>
            </a>
            <a
              href={`tel:${contact.phone}`}
              className="flex items-center gap-3 bg-white/20 hover:bg-white/30 transition-colors rounded-xl px-4 py-3 font-semibold"
            >
              <PhoneSVG />
              <span>Call {contact.phone}</span>
            </a>
            <a
              href={`mailto:${contact.email}?subject=Payment for Order ${order?.orderNumber || ''}`}
              className="flex items-center gap-3 bg-white/20 hover:bg-white/30 transition-colors rounded-xl px-4 py-3 font-semibold"
            >
              <EmailSVG />
              <span>Email {contact.email}</span>
            </a>
          </div>
        </div>

        {/* What happens next */}
        <div className="card p-5 mb-6">
          <h3 className="font-semibold text-navy-800 mb-4">What happens next</h3>
          <div className="space-y-4">
            {STEPS_NEXT.map(({ icon: Icon, label, desc, done }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${done ? 'text-green-700' : 'text-gray-700'}`}>{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order summary */}
        {order && (
          <div className="card p-5 mb-6">
            <h3 className="font-semibold text-navy-800 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              {order.items?.slice(0, 3).map((item, i) => (
                <div key={i} className="flex justify-between text-gray-600">
                  <span className="truncate pr-2">{item.name} × {item.quantity}</span>
                  <span className="font-medium flex-shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              {order.items?.length > 3 && (
                <p className="text-xs text-gray-400">+{order.items.length - 3} more item(s)</p>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-navy-800">
                <span>Total</span>
                <span>{formatCurrency(order.pricing?.total)}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-xs">
                <span>Delivery to</span>
                <span>{order.shippingAddress?.city}, {order.shippingAddress?.region}</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 flex-wrap justify-center">
          <Link to="/account/orders" className="btn-primary px-6 py-2.5 flex items-center gap-2">
            <ClockIcon className="w-4 h-4" /> Track My Orders
          </Link>
          <Link to="/shop" className="btn-secondary px-6 py-2.5 flex items-center gap-2">
            <ShoppingBagIcon className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>
      </div>
    </>
  );
};

export default OrderConfirmationPage;
