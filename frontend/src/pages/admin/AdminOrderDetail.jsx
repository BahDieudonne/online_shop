import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon, PrinterIcon, TruckIcon, CheckCircleIcon,
  XCircleIcon, ClockIcon, MapPinIcon, PhoneIcon, EnvelopeIcon,
  DocumentTextIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import orderService from '../../services/orderService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import Spinner from '../../components/common/Spinner';

const STATUS_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'yellow', icon: ClockIcon },
  confirmed:  { label: 'Confirmed',  color: 'blue',   icon: CheckCircleIcon },
  processing: { label: 'Processing', color: 'purple', icon: ClockIcon },
  shipped:    { label: 'Shipped',    color: 'indigo', icon: TruckIcon },
  delivered:  { label: 'Delivered',  color: 'green',  icon: CheckCircleIcon },
  cancelled:  { label: 'Cancelled',  color: 'red',    icon: XCircleIcon },
  refunded:   { label: 'Refunded',   color: 'gray',   icon: XCircleIcon },
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderById(id);
      setOrder(data);
      setTrackingInput(data.trackingNumber || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await orderService.updateOrderStatus(id, { status: newStatus, trackingNumber: trackingInput });
      await fetchOrder();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const addNote = async () => {
    if (!noteInput.trim()) return;
    try {
      await orderService.addOrderNote(id, noteInput);
      setNoteInput('');
      await fetchOrder();
    } catch (err) { console.error(err); }
  };

  const cancelOrder = async () => {
    try {
      setUpdating(true);
      await orderService.cancelOrder(id, cancelReason);
      setShowCancelModal(false);
      await fetchOrder();
    } catch (err) { console.error(err); } finally { setUpdating(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!order) return <div className="text-center py-20 text-gray-500">Order not found</div>;

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const currentStep = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/orders')} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
            <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="btn-outline flex items-center gap-2">
            <PrinterIcon className="w-4 h-4" /> Print Invoice
          </button>
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <button onClick={() => setShowCancelModal(true)} className="btn-danger flex items-center gap-2">
              <XCircleIcon className="w-4 h-4" /> Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      {order.status !== 'cancelled' && order.status !== 'refunded' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Order Progress</h2>
          <div className="flex items-center">
            {STATUS_FLOW.map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      done ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 text-gray-400'
                    } ${active ? 'ring-4 ring-indigo-100' : ''}`}>
                      {done ? <CheckCircleIcon className="w-5 h-5" /> : <span className="text-xs">{i+1}</span>}
                    </div>
                    <span className={`text-xs mt-2 font-medium capitalize ${done ? 'text-indigo-600' : 'text-gray-400'}`}>
                      {STATUS_CONFIG[step]?.label}
                    </span>
                  </div>
                  {i < STATUS_FLOW.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mb-5 ${i < currentStep ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            {STATUS_FLOW.map((step, i) => {
              if (i <= currentStep) return null;
              if (i > currentStep + 1) return null;
              return (
                <button key={step} onClick={() => updateStatus(step)} disabled={updating}
                  className="btn-primary flex items-center gap-2">
                  {updating ? <Spinner size="sm" /> : <TruckIcon className="w-4 h-4" />}
                  Mark as {STATUS_CONFIG[step]?.label}
                </button>
              );
            })}
            {/* Tracking input shown when shipping */}
            {order.status === 'confirmed' || order.status === 'processing' ? (
              <div className="flex gap-2 items-center">
                <input value={trackingInput} onChange={e => setTrackingInput(e.target.value)}
                  placeholder="Tracking number (optional)"
                  className="input-field text-sm py-2 w-56" />
              </div>
            ) : null}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Order Items ({order.items?.length})</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items?.map((item, idx) => (
                <div key={idx} className="p-6 flex gap-4">
                  <img src={item.product?.images?.[0]?.url || '/placeholder.jpg'}
                    alt={item.name} className="w-16 h-16 rounded-lg object-cover border" />
                  <div className="flex-1 min-w-0">
                    <Link to={`/admin/products/${item.product?._id}`}
                      className="font-medium text-gray-900 hover:text-indigo-600 line-clamp-1">
                      {item.name}
                    </Link>
                    {item.variant && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {Object.entries(item.variant).map(([k,v]) => `${k}: ${v}`).join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-0.5">SKU: {item.sku || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(item.price)} × {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="p-6 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>{order.shippingCost === 0 ? 'Free' : formatCurrency(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span><span>{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Order Notes</h2>
            {order.notes?.length > 0 ? (
              <div className="space-y-3 mb-4">
                {order.notes.map((note, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{note.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{note.author} · {formatDateTime(note.createdAt)}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-gray-400 mb-4">No notes yet.</p>}
            <div className="flex gap-2">
              <input value={noteInput} onChange={e => setNoteInput(e.target.value)}
                placeholder="Add an internal note..." className="input-field flex-1 text-sm py-2" />
              <button onClick={addNote} className="btn-primary py-2 px-4">Add</button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Status badge */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Status</h2>
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
              bg-${cfg.color}-100 text-${cfg.color}-700`}>
              <StatusIcon className="w-4 h-4" />
              {cfg.label}
            </span>
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-1">Payment</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {order.paymentStatus}
              </span>
              <p className="text-xs text-gray-500 mt-1">{order.paymentMethod?.replace(/_/g, ' ')}</p>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Customer</h2>
            <div className="space-y-2">
              <p className="font-medium text-gray-900">
                {order.user?.firstName} {order.user?.lastName}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <EnvelopeIcon className="w-4 h-4" />
                <a href={`mailto:${order.user?.email}`} className="hover:text-indigo-600">
                  {order.user?.email}
                </a>
              </div>
              {order.user?.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <PhoneIcon className="w-4 h-4" />
                  <span>{order.user.phone}</span>
                </div>
              )}
            </div>
            <Link to={`/admin/customers/${order.user?._id}`}
              className="mt-4 block text-sm text-indigo-600 hover:underline">
              View customer profile →
            </Link>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Shipping Address</h2>
            <div className="flex gap-2">
              <MapPinIcon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-800">{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.address}</p>
                {order.shippingAddress?.address2 && <p>{order.shippingAddress.address2}</p>}
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.region}</p>
                <p>{order.shippingAddress?.country}</p>
                {order.shippingAddress?.phone && <p className="mt-1">{order.shippingAddress.phone}</p>}
              </div>
            </div>
          </div>

          {/* Tracking */}
          {order.trackingNumber && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-2">Tracking</h2>
              <div className="flex items-center gap-2">
                <TruckIcon className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-mono text-indigo-600">{order.trackingNumber}</span>
              </div>
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
              <h3 className="text-lg font-semibold text-gray-900">Cancel Order</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to cancel order #{order.orderNumber}? This action may trigger a refund.
            </p>
            <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (optional)"
              className="input-field w-full text-sm mb-4" rows={3} />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCancelModal(false)} className="btn-outline">Keep Order</button>
              <button onClick={cancelOrder} disabled={updating} className="btn-danger flex items-center gap-2">
                {updating && <Spinner size="sm" />} Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
