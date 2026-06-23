import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, TagIcon,
  XMarkIcon, CheckIcon, ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import Spinner from '../../components/common/Spinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import api from '../../services/api';

const BLANK = {
  code: '', type: 'percentage', value: '', minOrderAmount: '',
  maxUses: '', expiresAt: '', isActive: true, description: ''
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [copied, setCopied] = useState(null);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/coupons');
      setCoupons(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const openCreate = () => {
    setForm(BLANK); setEditId(null); setErrors({});
    setShowModal(true);
  };

  const openEdit = (coupon) => {
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(coupon.value),
      minOrderAmount: String(coupon.minOrderAmount || ''),
      maxUses: String(coupon.maxUses || ''),
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : '',
      isActive: coupon.isActive,
      description: coupon.description || ''
    });
    setEditId(coupon._id);
    setErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.code.trim()) e.code = 'Code is required';
    if (!form.value || isNaN(form.value) || Number(form.value) <= 0) e.value = 'Valid value required';
    if (form.type === 'percentage' && Number(form.value) > 100) e.value = 'Max 100%';
    return e;
  };

  const save = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    try {
      setSaving(true);
      const payload = {
        ...form,
        code: form.code.toUpperCase().trim(),
        value: Number(form.value),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        expiresAt: form.expiresAt || null,
      };
      if (editId) await api.put(`/coupons/${editId}`, payload);
      else await api.post('/coupons', payload);
      setShowModal(false);
      await fetchCoupons();
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Failed to save' });
    } finally { setSaving(false); }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    await api.delete(`/coupons/${id}`);
    await fetchCoupons();
  };

  const toggleActive = async (coupon) => {
    await api.patch(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
    await fetchCoupons();
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setForm(f => ({ ...f, code }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <TagIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No coupons yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {coupons.map(c => (
            <div key={c._id} className={`bg-white rounded-xl border-2 p-5 transition-all
              ${c.isActive ? 'border-indigo-200' : 'border-gray-200 opacity-60'}`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <TagIcon className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-gray-900 font-mono text-lg">{c.code}</span>
                      <button onClick={() => copyCode(c.code)}
                        className="text-gray-400 hover:text-indigo-600 transition-colors">
                        {copied === c.code
                          ? <CheckIcon className="w-4 h-4 text-green-500" />
                          : <ClipboardDocumentIcon className="w-4 h-4" />}
                      </button>
                    </div>
                    {c.description && <p className="text-xs text-gray-500">{c.description}</p>}
                  </div>
                </div>
                <label className="flex items-center cursor-pointer">
                  <div className={`relative w-10 h-5 rounded-full transition-colors ${c.isActive ? 'bg-indigo-600' : 'bg-gray-300'}`}
                    onClick={() => toggleActive(c)}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform
                      ${c.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                </label>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 mb-3">
                <p className="text-2xl font-bold text-indigo-700">
                  {c.type === 'percentage' ? `${c.value}% OFF` :
                   c.type === 'fixed' ? `-${formatCurrency(c.value)}` : 'Free Shipping'}
                </p>
                {c.minOrderAmount > 0 && (
                  <p className="text-xs text-indigo-500">Min. order: {formatCurrency(c.minOrderAmount)}</p>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Used</span>
                  <span>{c.usedCount || 0}{c.maxUses ? ` / ${c.maxUses}` : ''}</span>
                </div>
                {c.expiresAt && (
                  <div className="flex justify-between">
                    <span>Expires</span>
                    <span className={new Date(c.expiresAt) < new Date() ? 'text-red-500' : ''}>
                      {formatDate(c.expiresAt)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <button onClick={() => openEdit(c)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-sm text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">
                  <PencilSquareIcon className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => deleteCoupon(c._id)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100">
                  <TrashIcon className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{editId ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {errors.api && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{errors.api}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
                <div className="flex gap-2">
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. SAVE20" className={`input-field flex-1 uppercase font-mono ${errors.code ? 'border-red-400' : ''}`} />
                  <button onClick={generateCode} className="btn-outline text-sm px-3">Generate</button>
                </div>
                {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="input-field w-full">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
                {form.type !== 'free_shipping' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Value {form.type === 'percentage' ? '(%)' : '(FCFA)'} *
                    </label>
                    <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                      placeholder={form.type === 'percentage' ? '20' : '5000'}
                      className={`input-field w-full ${errors.value ? 'border-red-400' : ''}`} min="0" />
                    {errors.value && <p className="text-xs text-red-500 mt-1">{errors.value}</p>}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min. Order (FCFA)</label>
                  <input type="number" value={form.minOrderAmount}
                    onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                    placeholder="0" className="input-field w-full" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                  <input type="number" value={form.maxUses}
                    onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                    placeholder="Unlimited" className="input-field w-full" min="1" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input type="date" value={form.expiresAt}
                  onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                  className="input-field w-full" min={new Date().toISOString().slice(0, 10)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <input value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Summer sale discount" className="input-field w-full" />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded" />
                  <span className="text-sm text-gray-700">Active (usable immediately)</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="btn-outline">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving && <Spinner size="sm" />}
                {editId ? 'Save Changes' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
