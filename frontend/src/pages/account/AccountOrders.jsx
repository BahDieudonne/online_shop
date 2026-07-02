import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ShoppingBagIcon,
  ClockIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import orderService from '../../services/orderService';
import { formatCurrency } from '../../utils/formatters';
import { Spinner } from '../../components/common/Spinner';

const STATUS_CONFIG = {
  pending_payment: { label: 'Awaiting Payment', color: 'bg-amber-100 text-amber-700', icon: ClockIcon },
  confirmed:       { label: 'Confirmed',         color: 'bg-blue-100 text-blue-700',   icon: CheckCircleSolid },
  processing:      { label: 'Processing',         color: 'bg-purple-100 text-purple-700', icon: ClockIcon },
  shipped:         { label: 'Shipped',             color: 'bg-indigo-100 text-indigo-700', icon: TruckIcon },
  out_for_delivery:{ label: 'Out for Delivery',   color: 'bg-sky-100 text-sky-700',     icon: TruckIcon },
  delivered:       { label: 'Delivered',           color: 'bg-green-100 text-green-700', icon: CheckCircleIcon },
  cancelled:       { label: 'Cancelled',           color: 'bg-red-100 text-red-700',     icon: XCircleIcon },
  refunded:        { label: 'Refunded',            color: 'bg-gray-100 text-gray-700',   icon: XCircleIcon },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-600', icon: ClockIcon };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const AccountOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderService.getOrders({ page, limit: 10, status: statusFilter || undefined });
      setOrders(res.data?.data || []);
      setPagination(res.data?.pagination || null);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <Helmet><title>My Orders CHANCELOR STORE</title></Helmet>
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-navy-900">My Orders</h1>
          {pagination && <p className="text-sm text-gray-500">{pagination.total} order(s)</p>}
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setStatusFilter(''); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${!statusFilter ? 'bg-navy-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            All
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${statusFilter === s ? 'bg-navy-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : orders.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            <ShoppingBagIcon className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <p className="font-semibold text-gray-500 mb-1">No orders yet</p>
            <p className="text-sm mb-4">When you place an order it will appear here.</p>
            <Link to="/shop" className="btn-primary px-6 py-2">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/account/orders/${order._id}`}
                className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow group"
              >
                {/* Thumbnail stack */}
                <div className="flex -space-x-2 flex-shrink-0">
                  {order.items?.slice(0, 3).map((item, i) => (
                    <img
                      key={i}
                      src={item.image || '/placeholder.jpg'}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover border-2 border-white"
                      style={{ zIndex: 3 - i }}
                    />
                  ))}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-navy-600">#{order.orderNumber}</span>
                    <StatusBadge status={order.status} />
                    {order.isPreOrder && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">Pre-order</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {order.items?.length} item(s) · {formatDate(order.createdAt)}
                  </p>
                  {order.status === 'pending_payment' && (
                    <p className="text-xs text-amber-600 mt-1 font-medium">
                      Contact us via WhatsApp to complete payment
                    </p>
                  )}
                  {order.status === 'shipped' && order.shipping?.trackingNumber && (
                    <p className="text-xs text-indigo-600 mt-1">Tracking: {order.shipping.trackingNumber}</p>
                  )}
                </div>

                {/* Total + arrow */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-bold text-navy-800">{formatCurrency(order.pricing?.total)}</span>
                  <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-navy-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination?.pages > 1 && (
          <div className="flex justify-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Prev</button>
            <span className="px-3 py-1.5 text-sm text-gray-600">Page {page} of {pagination.pages}</span>
            <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
    </>
  );
};

export default AccountOrders;
