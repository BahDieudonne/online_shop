import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, FolderIcon,
  FolderOpenIcon, XMarkIcon, PhotoIcon
} from '@heroicons/react/24/outline';
import Spinner from '../../components/common/Spinner';
import api from '../../services/api';

const BLANK = { name: '', slug: '', description: '', parent: '', image: '', isActive: true };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [expanded, setExpanded] = useState({});

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories?tree=true');
      setCategories(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openCreate = (parentId = '') => {
    setForm({ ...BLANK, parent: parentId }); setEditId(null); setErrors({});
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setForm({
      name: cat.name, slug: cat.slug, description: cat.description || '',
      parent: cat.parent?._id || '',
      image: cat.image?.url || cat.image || '',
      isActive: cat.isActive !== false,
    });
    setEditId(cat._id); setErrors({}); setShowModal(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name required';
    return e;
  };

  const save = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    try {
      setSaving(true);
      const payload = {
        ...form,
        parent: form.parent || null,
        image: form.image ? { url: form.image } : undefined,
      };
      if (editId) await api.put(`/categories/${editId}`, payload);
      else await api.post('/categories', payload);
      setShowModal(false);
      await fetchCategories();
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Save failed' });
    } finally { setSaving(false); }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category? This may affect products assigned to it.')) return;
    await api.delete(`/categories/${id}`);
    await fetchCategories();
  };

  const generateSlug = (name) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleNameChange = (name) => {
    setForm(f => ({ ...f, name, slug: f.slug || generateSlug(name) }));
  };

  const toggleExpand = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const CategoryRow = ({ cat, depth = 0 }) => {
    const hasChildren = cat.children?.length > 0;
    const isExpanded = expanded[cat._id];
    return (
      <>
        <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100">
          <td className="px-6 py-4">
            <div className="flex items-center gap-2" style={{ paddingLeft: depth * 24 }}>
              {hasChildren ? (
                <button onClick={() => toggleExpand(cat._id)} className="text-gray-400 hover:text-gray-600">
                  {isExpanded ? <FolderOpenIcon className="w-5 h-5 text-indigo-500" /> : <FolderIcon className="w-5 h-5 text-gray-400" />}
                </button>
              ) : (
                <span className="w-5 text-center text-gray-300">—</span>
              )}
              {(cat.image?.url || cat.image) && (
                <img src={cat.image?.url || cat.image} alt="" className="w-8 h-8 rounded object-cover border" />
              )}
              <div>
                <p className="font-medium text-gray-900">{cat.name}</p>
                <p className="text-xs text-gray-400">/c/{cat.slug}</p>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 text-sm text-gray-500">{cat.description || '—'}</td>
          <td className="px-6 py-4 text-sm text-gray-500">{cat.productCount || 0}</td>
          <td className="px-6 py-4">
            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium
              ${cat.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {cat.isActive !== false ? 'Active' : 'Hidden'}
            </span>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-1">
              <button onClick={() => openCreate(cat._id)} title="Add subcategory"
                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
                <PlusIcon className="w-4 h-4" />
              </button>
              <button onClick={() => openEdit(cat)} title="Edit"
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                <PencilSquareIcon className="w-4 h-4" />
              </button>
              <button onClick={() => deleteCategory(cat._id)} title="Delete"
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
        {hasChildren && isExpanded && cat.children.map(child => (
          <CategoryRow key={child._id} cat={child} depth={depth + 1} />
        ))}
      </>
    );
  };

  // Flat list for parent select
  const flatCats = [];
  const flatten = (cats, depth = 0) => cats.forEach(c => {
    flatCats.push({ _id: c._id, name: '  '.repeat(depth) + c.name });
    if (c.children) flatten(c.children, depth + 1);
  });
  flatten(categories);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500">Organize your product catalog</p>
        </div>
        <button onClick={() => openCreate()} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <FolderIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No categories yet.</p>
            <button onClick={() => openCreate()} className="mt-3 btn-primary text-sm">Create first category</button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Products</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => <CategoryRow key={cat._id} cat={cat} />)}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{editId ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setShowModal(false)}><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {errors.api && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{errors.api}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input value={form.name} onChange={e => handleNameChange(e.target.value)}
                  placeholder="e.g. Electronics" className={`input-field w-full ${errors.name ? 'border-red-400' : ''}`} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="auto-generated" className="input-field w-full font-mono text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <select value={form.parent} onChange={e => setForm(f => ({ ...f, parent: e.target.value }))}
                  className="input-field w-full">
                  <option value="">No parent (top-level)</option>
                  {flatCats.filter(c => c._id !== editId).map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} className="input-field w-full" placeholder="Short category description" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <div className="flex gap-2">
                  <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                    placeholder="https://…" className="input-field flex-1" />
                  {form.image && typeof form.image === 'string' && (
                    <img src={form.image} alt="" className="w-10 h-10 rounded object-cover border" />
                  )}
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 text-indigo-600 rounded" />
                <span className="text-sm text-gray-700">Active (visible to customers)</span>
              </label>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="btn-outline">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving && <Spinner size="sm" />} {editId ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
