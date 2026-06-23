import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon, FunnelIcon, UserCircleIcon,
  EyeIcon, ShoppingBagIcon, EnvelopeIcon, PhoneIcon,
  ArrowDownTrayIcon, ChevronUpDownIcon
} from '@heroicons/react/24/outline';
import Spinner from '../../components/common/Spinner';
import Pagination from '../../components/common/Pagination';
import { formatCurrency, formatDate } from '../../utils/formatters';
import api from '../../services/api';

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest first' },
  { value: 'createdAt', label: 'Oldest first' },
  { value: '-totalSpent', label: 'Most spent' },
  { value: '-orderCount', label: 'Most orders' },
  { value: 'firstName', label: 'Name A–Z' },
];

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showPanel, setShowPanel] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 20, sort });
      if (search) params.set('search', search);
      const res = await api.get(`/users/admin/customers?${params}`);
      setCustomers(res.data.data || []);
      setTotalPages(res.data.totalPages || res.data.pagination?.pages || 1);
      setTotalCustomers(res.data.total || res.data.pagination?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, sort, search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const openPanel = async (customer) => {
    setSelectedCustomer(customer);
    setShowPanel(true);
  };

  const exportCSV = async () => {
    const res = await api.get('/users/admin/customers/export', { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a'); a.href = url; a.download = 'customers.csv'; a.click();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">{totalCustomers.toLocaleString()} registered customers</p>
        </div>
        <button onClick={exportCSV} className="btn-outline flex items-center gap-2">
          <ArrowDownTrayIcon className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-60">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone…"
              className="pl-9 input-field w-full text-sm py-2" />
          </div>
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
            className="input-field text-sm py-2">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button type="submit" className="btn-primary py-2 px-4">Search</button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : customers.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No customers found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {c.avatar ? (
                          <img src={c.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-sm font-semibold text-indigo-600">
                              {c.firstName?.[0]}{c.lastName?.[0]}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{c.firstName} {c.lastName}</p>
                          <p className="text-xs text-gray-400">ID: {c._id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <EnvelopeIcon className="w-3.5 h-3.5 text-gray-400" />
                          {c.email}
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <PhoneIcon className="w-3.5 h-3.5 text-gray-400" />
                            {c.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                        <ShoppingBagIcon className="w-4 h-4 text-gray-400" />
                        {c.orderCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatCurrency(c.totalSpent || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(c.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium
                        ${c.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {c.isActive !== false ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => openPanel(c)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {/* Side Panel */}
      {showPanel && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setShowPanel(false)} />
          <div className="w-96 bg-white shadow-2xl overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Customer Details</h2>
              <button onClick={() => setShowPanel(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
                  {selectedCustomer.firstName?.[0]}{selectedCustomer.lastName?.[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedCustomer.firstName} {selectedCustomer.lastName}</h3>
                  <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                  <span className={`inline-flex mt-1 px-2 py-0.5 rounded text-xs font-medium
                    ${selectedCustomer.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {selectedCustomer.isActive !== false ? 'Active' : 'Blocked'}
                  </span>
                </div>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-indigo-600">{selectedCustomer.orderCount || 0}</p>
                  <p className="text-xs text-indigo-500 mt-1">Total Orders</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <p className="text-lg font-bold text-purple-600">{formatCurrency(selectedCustomer.totalSpent || 0)}</p>
                  <p className="text-xs text-purple-500 mt-1">Total Spent</p>
                </div>
              </div>
              {/* Info */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="text-gray-900">{selectedCustomer.phone || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Joined</span>
                  <span className="text-gray-900">{formatDate(selectedCustomer.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last login</span>
                  <span className="text-gray-900">{selectedCustomer.lastLogin ? formatDate(selectedCustomer.lastLogin) : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Role</span>
                  <span className="text-gray-900 capitalize">{selectedCustomer.role || 'customer'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                <Link to={`/admin/orders?customer=${selectedCustomer._id}`}
                  className="btn-outline text-center text-sm">View Orders</Link>
                <a href={`mailto:${selectedCustomer.email}`}
                  className="btn-primary text-center text-sm">Send Email</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
