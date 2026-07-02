import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PlusIcon, PencilIcon, TrashIcon, ArchiveBoxIcon, MagnifyingGlassIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import productService from '../../services/productService';
import { formatCurrency } from '../../utils/formatters';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import { Spinner } from '../../components/common/Spinner';

const STATUS_COLORS = { published: 'success', draft: 'secondary', archived: 'dark', scheduled: 'warning' };

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.getAdminProducts({ search, status, page, limit: 20 });
      setProducts(res.data?.data || []);
      setPagination(res.data?.pagination || null);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  }, [search, status, page]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id, permanent = false) => {
    if (!window.confirm(permanent ? 'Permanently delete this product? This cannot be undone.' : 'Archive this product?')) return;
    setDeleting(id);
    try {
      await (permanent ? productService.permanentDeleteProduct(id) : productService.deleteProduct(id));
      toast.success(permanent ? 'Product deleted' : 'Product archived');
      load();
      setSelected((s) => s.filter((x) => x !== id));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setDeleting(null); }
  };

  const handleBulkDelete = async () => {
    if (!selected.length || !window.confirm(`Archive ${selected.length} products?`)) return;
    await Promise.all(selected.map((id) => productService.deleteProduct(id)));
    toast.success(`${selected.length} products archived`);
    setSelected([]);
    load();
  };

  const toggleSelect = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const toggleAll = () => setSelected((s) => s.length === products.length ? [] : products.map((p) => p._id));

  return (
    <>
      <Helmet><title>Products Admin | CHANCELOR STORE</title></Helmet>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-navy-900">Products</h1>
            {pagination && <p className="text-sm text-gray-500 mt-0.5">{pagination.total} total products</p>}
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary flex items-center gap-1.5 text-sm px-3 py-2">
              <ArrowUpTrayIcon className="w-4 h-4" /> Import CSV
            </button>
            <Link to="/admin/products/new" className="btn-primary flex items-center gap-1.5 text-sm px-4 py-2">
              <PlusIcon className="w-4 h-4" /> Add Product
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input pl-9 text-sm py-2 w-full"
            />
          </div>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input text-sm py-2 min-w-36">
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
            <option value="scheduled">Scheduled</option>
          </select>
          {selected.length > 0 && (
            <button onClick={handleBulkDelete} className="flex items-center gap-1.5 text-sm text-red-600 font-medium bg-red-50 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors">
              <TrashIcon className="w-4 h-4" /> Archive {selected.length} selected
            </button>
          )}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-12 flex justify-center"><Spinner size="lg" /></div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 mb-3">No products found</p>
              <Link to="/admin/products/new" className="btn-primary text-sm px-4 py-2">Add your first product</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input type="checkbox" checked={selected.length === products.length && products.length > 0}
                        onChange={toggleAll} className="accent-navy-700" />
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Product</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Price</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Stock</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Sales</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((p) => (
                    <tr key={p._id} className={`hover:bg-gray-50 transition-colors ${selected.includes(p._id) ? 'bg-navy-50' : ''}`}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggleSelect(p._id)} className="accent-navy-700" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.images?.[0]?.thumbnail || p.images?.[0]?.url} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                          <div>
                            <Link to={`/admin/products/${p._id}/edit`} className="font-medium text-gray-800 hover:text-navy-700 line-clamp-1">{p.name}</Link>
                            <p className="text-xs text-gray-400">{p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.category?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-navy-800">{formatCurrency(p.discountPrice || p.price)}</div>
                        {p.discountPrice && p.discountPrice < p.price && (
                          <div className="text-xs text-gray-400 line-through">{formatCurrency(p.price)}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={p.stock === 0 ? 'danger' : p.stock < 10 ? 'warning' : 'success'} size="sm">
                          {p.stock}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_COLORS[p.status] || 'secondary'} size="sm">{p.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.analytics?.totalSales || 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/admin/products/${p._id}/edit`}
                            className="p-1.5 text-gray-400 hover:text-navy-600 hover:bg-navy-50 rounded-lg transition-colors">
                            <PencilIcon className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(p._id)}
                            disabled={deleting === p._id}
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Archive"
                          >
                            <ArchiveBoxIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id, true)}
                            disabled={deleting === p._id}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Permanent delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {pagination && pagination.pages > 1 && (
          <Pagination currentPage={page} totalPages={pagination.pages} onPageChange={setPage} />
        )}
      </div>
    </>
  );
};

export default AdminProducts;
