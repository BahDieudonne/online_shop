import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon, PrinterIcon, TruckIcon, CheckCircleIcon,
  XCircleIcon, ClockIcon, MapPinIcon, PhoneIcon, EnvelopeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import orderService from '../../services/orderService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import Spinner from '../../components/common/Spinner';

const STATUS_FLOW = ['pending_payment', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_CONFIG = {
  pending_payment:  { label: 'Awaiting Payment', color: 'yellow',  icon: ClockIcon        },
  confirmed:        { label: 'Confirmed',         color: 'blue',    icon: CheckCircleSolid },
  processing:       { label: 'Processing',         color: 'purple',  icon: ClockIcon        },
  shipped:          { label: 'Shipped',             color: 'indigo',  icon: TruckIcon        },
  out_for_delivery: { label: 'Out for Delivery',   color: 'sky',     icon: TruckIcon        },
  delivered:        { label: 'Delivered',           color: 'green',   icon: CheckCircleIcon  },
  cancelled:        { label: 'Cancelled',           color: 'red',     icon: XCircleIcon      },
  refunded:         { label: 'Refunded',            color: 'gray',    icon: XCircleIcon      },
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => { fetchOrder(); }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await orderService.getOrder(id);
      const data = res.data?.data;
      setOrder(data);
      setTrackingInput(data?.shipping?.trackingNumber || '');
      setNoteInput(data?.adminNotes || '');
    } catch (err) {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await orderService.updateOrderStatus(id, {
        status: newStatus,
        trackingNumber: trackingInput || undefined,
      });
      toast.success(`Order moved to ${STATUS_CONFIG[newStatus]?.label}`);
      await fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const saveNote = async () => {
    if (!noteInput.trim() && !order?.adminNotes) return;
    setSavingNote(true);
    try {
      await orderService.updateOrderNotes(id, noteInput);
      toast.success('Note saved');
    } catch {
      toast.error('Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  const cancelOrder = async () => {
    try {
      setUpdating(true);
      await orderService.cancelOrder(id, cancelReason);
      toast.success('Order cancelled');
      setShowCancelModal(false);
      await fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!order) return <div className="text-center py-20 text-gray-500">Order not found</div>;

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending_payment;
  const StatusIcon = cfg.icon;
  const currentStep = STATUS_FLOW.indexOf(order.status);
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/orders')} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.orderNumber}
              {order.isPreOrder && <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">Pre-order</span>}
            </h1>
            <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 text-sm">
            <PrinterIcon className="w-4 h-4" /> Print
          </button>
          {!isCancelled && order.status !== 'delivered' && (
            <button onClick={() => setShowCancelModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors">
              <XCircleIcon className="w-4 h-4" /> Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      {!isCancelled && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Order Progress</h2>
          <div className="flex items-center">
            {STATUS_FLOW.map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              const stepCfg = STATUS_CONFIG[step];
              const StepIcon = stepCfg?.icon || ClockIcon;
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      done ? 'bg-navy-700 border-navy-700 text-white' : 'border-gray-300 text-gray-400'
                    } ${active ? 'ring-4 ring-navy-100' : ''}`}>
                      {done ? <CheckCircleSolid className="w-5 h-5" /> : <StepIcon className="w-4 h-4" />}
                    </div>
                    <span className={`text-[11px] mt-2 text-center font-medium leading-tight px-1 ${done ? 'text-navy-700' : 'text-gray-400'}`}>
                      {stepCfg?.label}
                    </span>
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mb-6 ${i < currentStep ? 'bg-navy-600' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Action buttons next step only */}
          <div className="mt-6 flex flex-wrap gap-3 items-end">
            {STATUS_FLOW.map((step, i) => {
              if (i <= currentStep || i > currentStep + 1) return null;
              return (
                <button key={step} onClick={() => updateStatus(step)} disabled={updating}
                  className="btn-primary flex items-center gap-2 text-sm">
                  {updating ? <Spinner size="sm" /> : <CheckCircleSolid className="w-4 h-4" />}
                  Mark as "{STATUS_CONFIG[step]?.label}"
                </button>
              );
            })}

            {/* Tracking number input for shipping phase */}
            {(order.status === 'confirmed' || order.status === 'processing') && (
              <div className="flex gap-2 items-center ml-2">
                <input
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Tracking number (optional)"
                  className="input text-sm py-2 w-52"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <XCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-800">{STATUS_CONFIG[order.status]?.label}</p>
            {order.cancelReason && <p className="text-sm text-red-600">Reason: {order.cancelReason}</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left items + notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Items ({order.items?.length})</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item, idx) => (
                <div key={idx} className="p-5 flex gap-4">
                  <img
                    src={item.image || item.product?.images?.[0]?.url || '/placeholder.jpg'}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 line-clamp-1">{item.name}</p>
                    {item.variant && <p className="text-sm text-gray-500 mt-0.5">{item.variant}</p>}
                    <p className="text-sm text-gray-500 mt-0.5">SKU: {item.sku || 'N/A'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(item.price)} × {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Pricing totals */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{formatCurrency(order.pricing?.subtotal)}</span>
              </div>
              {order.pricing?.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span>-{formatCurrency(order.pricing?.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{order.pricing?.shippingFee === 0 ? 'Free' : formatCurrency(order.pricing?.shippingFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100 text-base">
                <span>Total</span><span>{formatCurrency(order.pricing?.total)}</span>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Admin Notes</h2>
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Add internal notes (payment details, customer communication, etc.)..."
              className="input w-full text-sm resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button onClick={saveNote} disabled={savingNote} className="btn-primary text-sm py-1.5 px-4">
                {savingNote ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>

          {/* Tracking history */}
          {order.trackingHistory?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Tracking History</h2>
              <div className="space-y-3">
                {[...order.trackingHistory].reverse().map((evt, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-navy-600 mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800 capitalize">{evt.status?.replace(/_/g, ' ')}</p>
                      {evt.message && <p className="text-xs text-gray-500">{evt.message}</p>}
                      <p className="text-xs text-gray-400">{formatDateTime(evt.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right status, customer, address */}
        <div className="space-y-5">
          {/* Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Status</h2>
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-${cfg.color}-100 text-${cfg.color}-700`}>
              <StatusIcon className="w-4 h-4" />
              {cfg.label}
            </span>
            <div className="mt-3 text-sm space-y-1">
              <div className="flex justify-between text-gray-500">
                <span>Payment</span>
                <span className={`font-medium ${order.payment?.status === 'paid' ? 'text-green-700' : 'text-amber-600'}`}>
                  {order.payment?.status || 'pending'}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Method</span>
                <span className="font-medium text-gray-700 capitalize">{order.payment?.method?.replace(/_/g, ' ') || 'Manual'}</span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Customer</h2>
            <p className="font-medium text-gray-900">
              {order.customer?.firstName} {order.customer?.lastName}
            </p>
            <div className="mt-2 space-y-1.5 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4" />
                <a href={`mailto:${order.customer?.email}`} className="hover:text-navy-600 truncate">
                  {order.customer?.email}
                </a>
              </div>
              {order.customer?.phone && (
                <div className="flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4" />
                  <span>{order.customer.phone}</span>
                </div>
              )}
            </div>
            <Link to={`/admin/customers/${order.customer?._id}`} className="mt-3 block text-xs text-navy-600 hover:underline">
              View customer profile →
            </Link>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Delivery Address</h2>
            <div className="flex gap-2">
              <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-600 space-y-0.5">
                <p className="font-medium text-gray-800">{order.shippingAddress?.fullName}</p>
                {order.shippingAddress?.phone && <p>{order.shippingAddress.phone}</p>}
                <p>{order.shippingAddress?.street || order.shippingAddress?.address}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.region}</p>
                <p>{order.shippingAddress?.country}</p>
                {order.shippingAddress?.notes && (
                  <p className="text-gray-400 text-xs mt-1">Note: {order.shippingAddress.notes}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tracking number */}
          {order.shipping?.trackingNumber && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-2">Tracking</h2>
              <div className="flex items-center gap-2 text-sm">
                <TruckIcon className="w-4 h-4 text-navy-500" />
                <span className="font-mono text-navy-600">{order.shipping.trackingNumber}</span>
              </div>
              {order.shipping.carrier && <p className="text-xs text-gray-500 mt-1">Carrier: {order.shipping.carrier}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Cancel Order #{order.orderNumber}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              This will cancel the order and notify the customer.
              {['confirmed', 'processing'].includes(order.status) && ' Stock will be restored automatically.'}
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (optional)"
              className="input w-full text-sm mb-4"
              rows={3}
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCancelModal(false)} className="btn-secondary">Keep Order</button>
              <button onClick={cancelOrder} disabled={updating} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                {updating && <Spinner size="sm" />} Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
