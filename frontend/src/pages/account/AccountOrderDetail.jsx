import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeftIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import orderService from '../../services/orderService';
import { formatCurrency } from '../../utils/formatters';
import { Spinner } from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import api from '../../services/api';

const WhatsAppSVG = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const STATUS_CONFIG = {
  pending_payment: { label: 'Awaiting Payment', color: 'text-amber-600 bg-amber-50',   icon: ClockIcon       },
  confirmed:       { label: 'Confirmed',         color: 'text-blue-700 bg-blue-50',     icon: CheckCircleSolid },
  processing:      { label: 'Processing',         color: 'text-purple-700 bg-purple-50', icon: ClockIcon       },
  shipped:         { label: 'Shipped',             color: 'text-indigo-700 bg-indigo-50', icon: TruckIcon       },
  out_for_delivery:{ label: 'Out for Delivery',   color: 'text-sky-700 bg-sky-50',       icon: TruckIcon       },
  delivered:       { label: 'Delivered',           color: 'text-green-700 bg-green-50',  icon: CheckCircleIcon },
  cancelled:       { label: 'Cancelled',           color: 'text-red-700 bg-red-50',      icon: XCircleIcon     },
  refunded:        { label: 'Refunded',            color: 'text-gray-600 bg-gray-50',    icon: XCircleIcon     },
};

const FLOW = ['pending_payment', 'confirmed', 'processing', 'shipped', 'delivered'];

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function AccountOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [contact, setContact] = useState({ whatsapp: '+237 674 962 803', phone: '+237 674 962 803' });

  useEffect(() => {
    orderService.getOrder(id).then((r) => setOrder(r.data?.data)).catch(() => {}).finally(() => setLoading(false));
    api.get('/settings/page-contact').then((r) => {
      const d = r.data?.data;
      if (d) setContact({ whatsapp: d.whatsapp || contact.whatsapp, phone: d.phone || contact.phone });
    }).catch(() => {});
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await orderService.cancelOrder(id, cancelReason);
      toast.success('Order cancelled');
      setShowCancel(false);
      orderService.getOrder(id).then((r) => setOrder(r.data?.data)).catch(() => {});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!order) return (
    <div className="text-center py-20 text-gray-400">
      <p className="text-lg font-semibold mb-2">Order not found</p>
      <Link to="/account/orders" className="btn-primary px-4 py-2 text-sm">Back to Orders</Link>
    </div>
  );

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending_payment;
  const StatusIcon = cfg.icon;
  const currentStep = FLOW.indexOf(order.status);
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded';
  const canCancel = !['shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'].includes(order.status);

  const waNumber = contact.whatsapp?.replace(/[^0-9]/g, '');
  const waMsg = encodeURIComponent(`Hello, I'm following up on my order #${order.orderNumber} Total: ${order.pricing?.total?.toLocaleString()} XAF`);

  return (
    <>
      <Helmet><title>Order #{order.orderNumber} CHANCELOR STORE</title></Helmet>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/account/orders')} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-navy-900">Order #{order.orderNumber}</h1>
            <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
          </div>
          <span className={`ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${cfg.color}`}>
            <StatusIcon className="w-4 h-4" />
            {cfg.label}
          </span>
        </div>

        {/* Payment reminder */}
        {order.status === 'pending_payment' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="font-semibold text-amber-800 mb-1">Payment required</p>
            <p className="text-sm text-amber-700 mb-3">Contact us to complete your payment and confirm this order.</p>
            <div className="flex gap-2 flex-wrap">
              <a
                href={`https://wa.me/${waNumber}?text=${waMsg}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <WhatsAppSVG /> Pay via WhatsApp
              </a>
              <a
                href={`tel:${contact.phone}`}
                className="inline-flex items-center gap-2 bg-navy-700 hover:bg-navy-800 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <PhoneIcon className="w-4 h-4" /> Call Us
              </a>
            </div>
          </div>
        )}

        {/* Progress timeline */}
        {!isCancelled && (
          <div className="card p-5">
            <h2 className="font-semibold text-navy-800 mb-4">Order Progress</h2>
            <div className="flex items-center">
              {FLOW.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                const cfg2 = STATUS_CONFIG[step];
                const Icon2 = cfg2?.icon || ClockIcon;
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center min-w-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                        done ? 'bg-navy-700 border-navy-700 text-white' : 'border-gray-200 text-gray-300'
                      } ${active ? 'ring-4 ring-navy-100' : ''}`}>
                        {done ? <CheckCircleSolid className="w-5 h-5" /> : <Icon2 className="w-4 h-4" />}
                      </div>
                      <span className={`text-[10px] mt-1 text-center font-medium leading-tight ${done ? 'text-navy-700' : 'text-gray-400'}`}>
                        {cfg2?.label?.split(' ')[0]}
                      </span>
                    </div>
                    {i < FLOW.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < currentStep ? 'bg-navy-600' : 'bg-gray-200'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Tracking history */}
        {order.trackingHistory?.length > 0 && (
          <div className="card p-5">
            <h2 className="font-semibold text-navy-800 mb-3">Tracking History</h2>
            <div className="space-y-3">
              {[...order.trackingHistory].reverse().map((evt, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-navy-600 mt-1.5 flex-shrink-0" />
                    {i < order.trackingHistory.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-sm font-medium text-gray-800 capitalize">{evt.status?.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">{evt.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(evt.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-navy-800">Items ({order.items?.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {order.items?.map((item, i) => (
              <div key={i} className="flex gap-3 p-4">
                <img src={item.image || '/placeholder.jpg'} alt={item.name} className="w-14 h-14 rounded-lg object-cover border" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                  {item.variant && <p className="text-xs text-gray-400">{item.variant}</p>}
                  <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-navy-800">{formatCurrency(item.price * item.quantity)}</p>
                  <p className="text-xs text-gray-400">{formatCurrency(item.price)} each</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(order.pricing?.subtotal)}</span></div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className={order.pricing?.shippingFee === 0 ? 'text-green-600 font-medium' : ''}>
                {order.pricing?.shippingFee === 0 ? 'Free' : formatCurrency(order.pricing?.shippingFee)}
              </span>
            </div>
            {order.pricing?.discount > 0 && (
              <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(order.pricing?.discount)}</span></div>
            )}
            <div className="flex justify-between font-bold text-navy-800 text-base pt-1 border-t border-gray-200">
              <span>Total</span><span>{formatCurrency(order.pricing?.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery address */}
        <div className="card p-5">
          <h2 className="font-semibold text-navy-800 mb-3 flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-gray-500" /> Delivery Address
          </h2>
          <div className="text-sm text-gray-600 space-y-0.5">
            <p className="font-medium text-gray-800">{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.phone}</p>
            <p>{order.shippingAddress?.street || order.shippingAddress?.address}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.region}</p>
            <p>{order.shippingAddress?.country}</p>
            {order.shippingAddress?.notes && (
              <p className="text-gray-400 text-xs mt-1">Note: {order.shippingAddress.notes}</p>
            )}
          </div>
        </div>

        {/* Cancel button */}
        {canCancel && (
          <div className="text-right">
            <button
              onClick={() => setShowCancel(true)}
              className="text-sm text-red-600 hover:text-red-700 underline"
            >
              Cancel this order
            </button>
          </div>
        )}

        {/* Cancel modal */}
        {showCancel && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                <h3 className="font-bold text-gray-900">Cancel Order</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to cancel order #{order.orderNumber}?
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason (optional)"
                className="input w-full text-sm mb-4"
                rows={2}
              />
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowCancel(false)} className="btn-secondary">Keep Order</button>
                <button onClick={handleCancel} disabled={cancelling} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60">
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
