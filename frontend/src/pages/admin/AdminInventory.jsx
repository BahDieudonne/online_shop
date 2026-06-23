import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ExclamationTriangleIcon, XCircleIcon, MagnifyingGlassIcon,
  ArrowPathIcon, ArrowDownTrayIcon, PencilSquareIcon
} from '@heroicons/react/24/outline';
import Spinner from '../../components/common/Spinner';
import Pagination from '../../components/common/Pagination';
import { formatCurrency } from '../../utils/formatters';
import api from '../../services/api';

const STOCK_FILTERS = [
  { key: 'all', label: 'All Products' },
  { key: 'low', label: 'Low Stock' },
  { key: 'out', label: 'Out of Stock' },
  { key: 'ok', label: 'In Stock' },
];

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockFilter, setStockFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({ total: 0, low: 0, out: 0, value: 0 });
  const [editingId, setEditingId] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 20, stockFilter });
      if (search) params.set('search', search);
      const res = await api.get(`/products/admin/inventory?${params}`);
      setProducts(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setSummary(res.data.summary || { total: 0, low: 0, out: 0, value: 0 });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, stockFilter, search]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const saveStock = async (productId) => {
    try {
      setSaving(true);
      await api.patch(`/products/${productId}/stock`, { quantity: parseInt(editQty) });
      setEditingId(null);
      await fetchInventory();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const exportReport = async () => {
    const res = await api.get('/products/admin/inventory/export', { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a'); a.href = url; a.download = 'inventory.csv'; a.click();
  };

  const stockBadge = (qty, lowThreshold = 5) => {
    if (qty === 0) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700"><XCircleIcon className="w-3 h-3" /> Out of Stock</span>;
    if (qty <= lowThreshold) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700"><ExclamationTriangleIcon className="w-3 h-3" /> Low ({qty})</span>;
    return <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">In Stock ({qty})</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500">Real-time stock management and alerts</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchInventory} className="btn-outline flex items-center gap-2">
            <ArrowPathIcon className="w-4 h-4" /> Refresh
          </button>
          <button onClick={exportReport} className="btn-outline flex items-center gap-2">
            <ArrowDownTrayIcon className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total SKUs</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{summary.total.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-yellow-200 p-5">
          <p className="text-sm text-yellow-600">Low Stock</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{summary.low}</p>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-5">
          <p className="text-sm text-red-600">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{summary.out}</p>
        </div>
        <div className="bg-white rounded-xl border border-indigo-200 p-5">
          <p className="text-sm text-indigo-600">Inventory Value</p>
          <p className="text-xl font-bold text-indigo-600 mt-1">{formatCurrency(summary.value)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-60">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products…" className="pl-9 input-field w-full text-sm py-2" />
        </div>
        <div className="flex gap-2">
          {STOCK_FILTERS.map(f => (
            <button key={f.key} onClick={() => { setStockFilter(f.key); setPage(1); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${stockFilter === f.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No products found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p._id} className={`hover:bg-gray-50 transition-colors ${p.stock === 0 ? 'bg-red-50/30' : p.stock <= 5 ? 'bg-yellow-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0]?.url || '/placeholder.jpg'} alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover border" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-xs">{p.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">{p.sku || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.category?.name || '—'}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(p.price)}</td>
                    <td className="px-6 py-4">
                      {editingId === p._id ? (
                        <div className="flex items-center gap-2">
                          <input type="number" value={editQty} onChange={e => setEditQty(e.target.value)}
                            className="w-20 input-field text-sm py-1" min="0" />
                          <button onClick={() => saveStock(p._id)} disabled={saving}
                            className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700">
                            {saving ? '…' : 'Save'}
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-gray-900">{p.stock}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{stockBadge(p.stock, p.lowStockThreshold || 5)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditingId(p._id); setEditQty(String(p.stock)); }}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Edit stock">
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <Link to={`/admin/products/${p._id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title="Edit product">
                          <PencilSquareIcon className="w-4 h-4" />
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

      {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  );
}
