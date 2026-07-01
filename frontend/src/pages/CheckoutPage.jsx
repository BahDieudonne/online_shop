import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckIcon } from '@heroicons/react/24/solid';
import { orderService, validateCoupon } from '../services/orderService';
import { selectCartTotal } from '../redux/slices/cartSlice';
import { formatCurrency } from '../utils/formatters';
import { CAMEROON_REGIONS, PAYMENT_METHODS } from '../utils/constants';
import toast from 'react-hot-toast';

const STEPS = ['Shipping', 'Payment', 'Review'];


const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const total = useSelector(selectCartTotal);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [shipping, setShipping] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    region: '',
    country: 'Cameroon',
    notes: '',
  });
  const [payment, setPayment] = useState({ method: 'mtn_momo', momoNumber: '', momoProvider: 'mtn' });
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  const SF = (key) => ({ value: shipping[key], onChange: (e) => setShipping((s) => ({ ...s, [key]: e.target.value })) });

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await validateCoupon(couponCode.trim(), total);
      setDiscount(res.data?.data?.discountAmount || 0);
      toast.success('Coupon applied!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const orderData = {
        items: items.map((i) => ({ product: i.product._id, quantity: i.quantity, variant: i.variant?._id })),
        shippingAddress: shipping,
        paymentMethod: payment.method,
        couponCode: couponCode || undefined,
        ...(payment.method === 'mtn_momo' || payment.method === 'orange_money'
          ? { momoPhone: payment.momoNumber }
          : {}),
      };
      const res = await orderService.createOrder(orderData);
      const order = res.data?.data;
      navigate(`/order/success/${order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const finalTotal = Math.max(0, total - discount);

  return (
    <>
      <Helmet><title>Checkout — CHANCELOR STORE</title></Helmet>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="font-display text-2xl font-bold text-navy-900 mb-6">Checkout</h1>

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
                <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-navy-700' : i < step ? 'text-green-600' : 'text-gray-400'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-3 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2">
            {/* Step 0: Shipping */}
            {step === 0 && (
              <div className="card p-6 space-y-4">
                <h2 className="font-display font-semibold text-lg text-navy-800">Shipping Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">First Name *</label>
                    <input type="text" required className="input" {...SF('firstName')} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Last Name *</label>
                    <input type="text" required className="input" {...SF('lastName')} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Email *</label>
                    <input type="email" required className="input" {...SF('email')} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Phone Number *</label>
                    <input type="tel" required className="input" placeholder="+237..." {...SF('phone')} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700 block mb-1">Street Address *</label>
                    <input type="text" required className="input" placeholder="House/street, neighborhood..." {...SF('address')} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">City *</label>
                    <input type="text" required className="input" {...SF('city')} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Region *</label>
                    <select required className="input" {...SF('region')}>
                      <option value="">Select region</option>
                      {CAMEROON_REGIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700 block mb-1">Delivery Notes (Optional)</label>
                    <textarea rows={2} className="input resize-none" placeholder="Landmarks, instructions..." {...SF('notes')} />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!shipping.firstName || !shipping.address || !shipping.city || !shipping.region) {
                      toast.error('Please fill all required fields'); return;
                    }
                    setStep(1);
                  }}
                  className="btn-primary w-full py-3 font-semibold"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div className="card p-6 space-y-4">
                <h2 className="font-display font-semibold text-lg text-navy-800">Payment Method</h2>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map(({ id, label, Icon }) => (
                    <label key={id} className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      payment.method === id ? 'border-navy-600 bg-navy-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <input type="radio" name="payment" value={id} checked={payment.method === id}
                        onChange={() => setPayment((p) => ({ ...p, method: id }))} className="accent-navy-700" />
                      <Icon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      <span className="font-medium text-sm text-gray-800">{label}</span>
                    </label>
                  ))}
                </div>

                {/* MTN/Orange phone input */}
                {(payment.method === 'mtn_momo' || payment.method === 'orange_money') && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      {payment.method === 'mtn_momo' ? 'MTN' : 'Orange'} Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      className="input"
                      placeholder="+237 6XX XXX XXX"
                      value={payment.momoNumber}
                      onChange={(e) => setPayment((p) => ({ ...p, momoNumber: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">You will receive a payment prompt on this number.</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(0)} className="btn-secondary flex-1 py-3">Back</button>
                  <button onClick={() => setStep(2)} className="btn-primary flex-1 py-3 font-semibold">Review Order</button>
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className="card p-6 space-y-4">
                <h2 className="font-display font-semibold text-lg text-navy-800">Review Your Order</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item._id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                      <img src={item.product?.images?.[0]?.thumbnail || item.product?.images?.[0]?.url} alt={item.product?.name} className="w-14 h-14 object-cover rounded-lg" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.product?.name}</p>
                        {item.variantName && <p className="text-xs text-gray-400">{item.variantName}</p>}
                        <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-sm text-navy-700">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600"><span>Shipping address</span><span className="text-right text-gray-800 max-w-48">{shipping.address}, {shipping.city}, {shipping.region}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Payment</span><span className="flex items-center gap-1">{(() => { const pm = PAYMENT_METHODS.find(m => m.id === payment.method); return pm ? <><pm.Icon className="w-4 h-4" />{pm.label}</> : null; })()}</span></div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">Back</button>
                  <button onClick={handleSubmit} disabled={loading} className="btn-gold flex-1 py-3 font-bold">
                    {loading ? 'Placing Order...' : `Place Order (${formatCurrency(finalTotal)})`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="card p-5 h-fit space-y-4">
            <h3 className="font-display font-semibold text-navy-800">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal ({items.length} items)</span><span>{formatCurrency(total)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span className="text-green-600">{total >= 50000 ? 'Free' : formatCurrency(3000)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-600"><span>Coupon discount</span><span>-{formatCurrency(discount)}</span></div>}
              <div className="border-t pt-2 flex justify-between font-bold text-navy-800 text-base">
                <span>Total</span>
                <span>{formatCurrency(finalTotal + (total < 50000 ? 3000 : 0))}</span>
              </div>
            </div>
            {/* Coupon */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Coupon Code</label>
              <div className="flex gap-2">
                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="input flex-1 text-sm py-2" placeholder="CHANCELOR5000" />
                <button onClick={applyCoupon} disabled={couponLoading} className="btn-secondary text-xs px-3 py-2 whitespace-nowrap">
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700">
              🔒 Your payment is secured with 256-bit SSL encryption
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
