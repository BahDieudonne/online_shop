import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import orderService from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import { Spinner } from '../../components/common/Spinner';

const STATUS_COLORS = {
  pending: 'warning', processing: 'info', shipped: 'info',
  delivered: 'success', cancelled: 'danger', refunded: 'secondary',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

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

  return (
    <>
      <Helmet><title>Orders — Admin | CHANCELOR STORE</title></Helmet>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-navy-900">Orders</h1>
          {pagination && <p className="text-sm text-gray-500">{pagination.total} total orders</p>}
        </div>
        <div className="card p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by order # or customer..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input pl-9 text-sm py-2 w-full" />
          </div>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input text-sm py-2 min-w-36">
            <option value="">All Status</option>
            {['pending','processing','shipped','delivered','cancelled','refunded'].map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="card overflow-hidden">
          {loading ? <div className="p-12 flex justify-center"><Spinner size="lg" /></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-navy-600 font-medium">#{o.orderNumber}</td>
                      <td className="px-4 py-3 text-gray-700">{o.customer?.firstName} {o.customer?.lastName}</td>
                      <td className="px-4 py-3 text-gray-600">{o.items?.length} item(s)</td>
                      <td className="px-4 py-3 font-medium text-navy-800">{formatCurrency(o.pricing?.total)}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{o.payment?.method?.replace('_', ' ')}</td>
                      <td className="px-4 py-3"><Badge variant={STATUS_COLORS[o.status] || 'secondary'} size="sm">{o.status}</Badge></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(o.createdAt)}</td>
                      <td className="px-4 py-3"><Link to={`/admin/orders/${o._id}`} className="text-navy-600 hover:underline text-xs font-medium">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {pagination?.pages > 1 && <Pagination currentPage={page} totalPages={pagination.pages} onPageChange={setPage} />}
      </div>
    </>
  );
};

export default AdminOrders;
