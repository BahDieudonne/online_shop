import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckIcon, LockClosedIcon, TruckIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { orderService, validateCoupon } from '../services/orderService';
import { selectCartTotal } from '../redux/slices/cartSlice';
import { formatCurrency } from '../utils/formatters';
import { CAMEROON_REGIONS } from '../utils/constants';
import { useSettings } from '../context/SettingsContext';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { items } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const total = useSelector(selectCartTotal);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [shipping, setShipping] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    email:     user?.email     || '',
    phone:     user?.phone     || '',
    address:   '',
    city:      '',
    region:    '',
    country:   'Cameroon',
    notes:     '',
  });

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  const STEPS = ['Delivery Details', 'Review & Place Order'];

  const SF = (key) => ({
    value: shipping[key],
    onChange: (e) => setShipping((s) => ({ ...s, [key]: e.target.value })),
  });

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await validateCoupon(couponCode.trim(), total);
      setDiscount(res.data?.data?.discountAmount || 0);
      toast.success(t('checkout.couponApplied'));
    } catch (err) {
      toast.error(err.response?.data?.message || t('checkout.invalidCoupon'));
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const orderData = {
        shippingAddress: shipping,
        couponCode: couponCode || undefined,
        notes: shipping.notes || undefined,
      };
      const res = await orderService.createOrder(orderData);
      const order = res.data?.data;
      navigate(`/order/success/${order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || t('checkout.failedOrder'));
    } finally {
      setLoading(false);
    }
  };

  const shippingCost = total >= (settings.shipping?.freeShippingThreshold || 50000)
    ? 0
    : (settings.shipping?.defaultShippingCost || 2000);

  const finalTotal = Math.max(0, total - discount) + shippingCost;

  const isShippingValid = shipping.firstName && shipping.phone && shipping.address && shipping.city && shipping.region;

  return (
    <>
      <Helmet><title>Checkout CHANCELOR STORE</title></Helmet>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="font-display text-2xl font-bold text-navy-900 mb-6">{t('checkout.title')}</h1>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i < step ? 'bg-green-500 text-white' : i === step ? 'bg-navy-700 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {i < step ? <CheckIcon className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-navy-700' : i < step ? 'text-green-600' : 'text-gray-400'}`}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Payment notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">How payment works</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Place your order now, then contact us via WhatsApp, phone, or email to arrange payment.
              Your order will be confirmed once payment is received.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2">

            {/* Step 0: Delivery details */}
            {step === 0 && (
              <div className="card p-6 space-y-4">
                <h2 className="font-display font-semibold text-lg text-navy-800 flex items-center gap-2">
                  <TruckIcon className="w-5 h-5 text-navy-600" />
                  {t('checkout.shipping.title')}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">{t('checkout.shipping.firstName')} *</label>
                    <input type="text" required className="input" {...SF('firstName')} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">{t('checkout.shipping.lastName')}</label>
                    <input type="text" className="input" {...SF('lastName')} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">{t('checkout.shipping.phone')} *</label>
                    <input type="tel" required className="input" placeholder="+237 6XX XXX XXX" {...SF('phone')} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">{t('checkout.shipping.email')}</label>
                    <input type="email" className="input" {...SF('email')} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700 block mb-1">{t('checkout.shipping.address')} *</label>
                    <input type="text" required className="input" placeholder="House/street, neighborhood..." {...SF('address')} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">{t('checkout.shipping.city')} *</label>
                    <input type="text" required className="input" {...SF('city')} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">{t('checkout.shipping.region')} *</label>
                    <select required className="input" {...SF('region')}>
                      <option value="">Select region</option>
                      {CAMEROON_REGIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700 block mb-1">{t('checkout.shipping.notes')}</label>
                    <textarea rows={2} className="input resize-none" placeholder="Landmarks, delivery instructions..." {...SF('notes')} />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!isShippingValid) {
                      toast.error(t('checkout.shipping.requiredFields'));
                      return;
                    }
                    setStep(1);
                  }}
                  className="btn-primary w-full py-3 font-semibold"
                >
                  Review Order
                </button>
              </div>
            )}

            {/* Step 1: Review */}
            {step === 1 && (
              <div className="card p-6 space-y-5">
                <h2 className="font-display font-semibold text-lg text-navy-800 flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  {t('checkout.review.title')}
                </h2>

                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item._id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                      <img
                        src={item.product?.images?.[0]?.thumbnail || item.product?.images?.[0]?.url}
                        alt={item.product?.name}
                        className="w-14 h-14 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.product?.name}</p>
                        {item.variantName && <p className="text-xs text-gray-400">{item.variantName}</p>}
                        <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-sm text-navy-700">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Address summary */}
                <div className="bg-gray-50 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-gray-800 mb-1">Delivery to:</p>
                  <p className="text-gray-600">{shipping.firstName} {shipping.lastName}</p>
                  <p className="text-gray-600">{shipping.phone}</p>
                  <p className="text-gray-600">{shipping.address}, {shipping.city}, {shipping.region}</p>
                  {shipping.notes && <p className="text-gray-500 text-xs mt-1">Note: {shipping.notes}</p>}
                  <button onClick={() => setStep(0)} className="text-navy-600 text-xs font-medium hover:underline mt-2 block">
                    Edit delivery details
                  </button>
                </div>

                {/* Payment instruction */}
                <div className="bg-navy-50 border border-navy-200 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-navy-800 mb-1">Payment</p>
                  <p className="text-navy-700 text-xs">
                    After placing your order, contact us via WhatsApp or phone to arrange payment.
                    We accept MTN MoMo, Orange Money, and bank transfer.
                  </p>
                </div>

                <div className="flex gap-3 pt-1">
                  <button onClick={() => setStep(0)} className="btn-secondary flex-1 py-3">{t('common.back')}</button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-gold flex-1 py-3 font-bold"
                  >
                    {loading ? 'Placing Order...' : `Place Order ${formatCurrency(finalTotal)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="card p-5 h-fit space-y-4">
            <h3 className="font-display font-semibold text-navy-800">{t('checkout.orderSummary')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{t('checkout.subtotal')} ({items.length} {t('checkout.items')})</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t('checkout.shipping')}</span>
                <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
                  {shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t('checkout.couponDiscount')}</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-navy-800 text-base">
                <span>{t('checkout.total')}</span>
                <span>{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            {/* Coupon */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">{t('checkout.coupon.label')}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="input flex-1 text-sm py-2"
                  placeholder={t('checkout.coupon.placeholder')}
                />
                <button onClick={applyCoupon} disabled={couponLoading} className="btn-secondary text-xs px-3 py-2 whitespace-nowrap">
                  {couponLoading ? '...' : t('checkout.coupon.apply')}
                </button>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700">
              <LockClosedIcon className="w-3.5 h-3.5 inline-block mr-1 align-text-bottom" />
              Your order details are secure and encrypted
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
