import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MagnifyingGlassIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import orderService from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import { Spinner } from '../../components/common/Spinner';

const STATUS_COLORS = {
  pending_payment:  'warning',
  confirmed:        'info',
  processing:       'info',
  shipped:          'info',
  out_for_delivery: 'info',
  delivered:        'success',
  cancelled:        'danger',
  refunded:         'secondary',
};

const STATUS_LABELS = {
  pending_payment:  'Awaiting Payment',
  confirmed:        'Confirmed',
  processing:       'Processing',
  shipped:          'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
  refunded:         'Refunded',
};

const ALL_STATUSES = Object.keys(STATUS_LABELS);

// Next logical status for quick-confirm action
const QUICK_ACTIONS = {
  pending_payment: { next: 'confirmed', label: 'Confirm Payment' },
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [confirming, setConfirming] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderService.getAllOrders({ search, status, page, limit: 20 });
      setOrders(res.data?.data || []);
      setPagination(res.data?.pagination || null);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  }, [search, status, page]);

  useEffect(() => { load(); }, [load]);

  const quickConfirm = async (orderId, nextStatus, orderNumber) => {
    if (!window.confirm(`Mark order #${orderNumber} as "${STATUS_LABELS[nextStatus]}"?`)) return;
    setConfirming(orderId);
    try {
      await orderService.updateOrderStatus(orderId, { status: nextStatus });
      toast.success(`Order #${orderNumber} → ${STATUS_LABELS[nextStatus]}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setConfirming(null);
    }
  };

  return (
    <>
      <Helmet><title>Orders Admin | CHANCELOR STORE</title></Helmet>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-navy-900">Orders</h1>
          {pagination && <p className="text-sm text-gray-500">{pagination.total} total orders</p>}
        </div>

        <div className="card p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order # or customer..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input pl-9 text-sm py-2 w-full"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="input text-sm py-2 min-w-44"
          >
            <option value="">All Status</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center"><Spinner size="lg" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-gray-400">No orders found</td></tr>
                  ) : orders.map((o) => (
                    <tr key={o._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-navy-600 font-bold">#{o.orderNumber}</span>
                        {o.isPreOrder && (
                          <span className="ml-1 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-semibold">PRE</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{o.customer?.firstName} {o.customer?.lastName}</td>
                      <td className="px-4 py-3 text-gray-600">{o.items?.length} item(s)</td>
                      <td className="px-4 py-3 font-medium text-navy-800">{formatCurrency(o.pricing?.total)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_COLORS[o.status] || 'secondary'} size="sm">
                          {STATUS_LABELS[o.status] || o.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(o.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {QUICK_ACTIONS[o.status] && (
                            <button
                              onClick={() => quickConfirm(o._id, QUICK_ACTIONS[o.status].next, o.orderNumber)}
                              disabled={confirming === o._id}
                              className="inline-flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 text-white px-2.5 py-1 rounded-lg font-semibold transition-colors disabled:opacity-60"
                            >
                              {confirming === o._id ? '...' : <><CheckCircleIcon className="w-3 h-3" />{QUICK_ACTIONS[o.status].label}</>}
                            </button>
                          )}
                          <Link to={`/admin/orders/${o._id}`} className="text-navy-600 hover:underline text-xs font-medium">
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {pagination?.pages > 1 && (
          <Pagination currentPage={page} totalPages={pagination.pages} onPageChange={setPage} />
        )}
      </div>
    </>
  );
};

export default AdminOrders;
