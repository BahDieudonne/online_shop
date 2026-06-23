import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, PhotoIcon,
  DocumentTextIcon, QuestionMarkCircleIcon, StarIcon, XMarkIcon
} from '@heroicons/react/24/outline';
import Spinner from '../../components/common/Spinner';
import { formatDate } from '../../utils/formatters';
import api from '../../services/api';

const TABS = [
  { key: 'banners', label: 'Banners', icon: PhotoIcon },
  { key: 'blog', label: 'Blog Posts', icon: DocumentTextIcon },
  { key: 'faq', label: 'FAQs', icon: QuestionMarkCircleIcon },
  { key: 'testimonials', label: 'Testimonials', icon: StarIcon },
];

const BLANK_BANNER = { title: '', subtitle: '', ctaText: '', ctaUrl: '', image: '', bgColor: '#1a237e', isActive: true, order: 0 };
const BLANK_FAQ = { question: '', answer: '', category: 'General', isActive: true, order: 0 };
const BLANK_TESTIMONIAL = { name: '', role: '', message: '', rating: 5, avatar: '', isActive: true };

export default function AdminContent() {
  const [tab, setTab] = useState('banners');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const endpointMap = { banners: '/content/banners', blog: '/blog', faq: '/content/faqs', testimonials: '/content/testimonials' };

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`${endpointMap[tab]}?admin=true`);
      setItems(res.data.data || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openCreate = () => {
    const blank = tab === 'banners' ? BLANK_BANNER : tab === 'faq' ? BLANK_FAQ : tab === 'testimonials' ? BLANK_TESTIMONIAL : {};
    setForm(blank); setEditId(null); setShowModal(true);
  };

  const openEdit = (item) => {
    setForm({ ...item }); setEditId(item._id); setShowModal(true);
  };

  const save = async () => {
    try {
      setSaving(true);
      if (editId) await api.put(`${endpointMap[tab]}/${editId}`, form);
      else await api.post(endpointMap[tab], form);
      setShowModal(false);
      await fetchItems();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    await api.delete(`${endpointMap[tab]}/${id}`);
    await fetchItems();
  };

  const toggleActive = async (item) => {
    await api.patch(`${endpointMap[tab]}/${item._id}`, { isActive: !item.isActive });
    await fetchItems();
  };

  const renderBanners = () => (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map(b => (
        <div key={b._id} className={`rounded-xl border-2 overflow-hidden ${b.isActive ? 'border-indigo-200' : 'border-gray-200 opacity-60'}`}>
          <div className="relative h-32" style={{ background: b.bgColor || '#1a237e' }}>
            {b.image && <img src={b.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />}
            <div className="absolute inset-0 flex flex-col justify-center px-4 text-white">
              <p className="font-bold text-lg">{b.title}</p>
              {b.subtitle && <p className="text-sm opacity-80">{b.subtitle}</p>}
              {b.ctaText && (
                <span className="mt-2 inline-block bg-white text-indigo-700 text-xs px-3 py-1 rounded-full w-fit font-medium">
                  {b.ctaText}
                </span>
              )}
            </div>
          </div>
          <div className="p-3 bg-white flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button onClick={() => toggleActive(b)}
                className={`text-xs px-2 py-1 rounded font-medium ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {b.isActive ? 'Active' : 'Hidden'}
              </button>
              <span className="text-xs text-gray-400">Order: {b.order}</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEdit(b)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                <PencilSquareIcon className="w-4 h-4" />
              </button>
              <button onClick={() => deleteItem(b._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderBlog = () => (
    <div className="space-y-3">
      {items.map(post => (
        <div key={post._id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
          {post.coverImage && (
            <img src={post.coverImage} alt="" className="w-20 h-16 rounded-lg object-cover border flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-gray-900">{post.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{formatDate(post.createdAt)} · {post.author}</p>
              </div>
              <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded font-medium
                ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {post.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{post.excerpt || post.content?.slice(0, 100)}</p>
          </div>
          <div className="flex flex-col gap-1 flex-shrink-0">
            <button onClick={() => openEdit(post)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
              <PencilSquareIcon className="w-4 h-4" />
            </button>
            <button onClick={() => deleteItem(post._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFAQ = () => (
    <div className="space-y-3">
      {items.map(f => (
        <div key={f._id} className={`bg-white rounded-xl border border-gray-200 p-4 ${!f.isActive && 'opacity-60'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="font-medium text-gray-900">Q: {f.question}</p>
              <p className="text-sm text-gray-600 mt-1">A: {f.answer}</p>
              <span className="text-xs text-indigo-500 mt-1 inline-block">{f.category}</span>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => toggleActive(f)}
                className={`text-xs px-2 py-1 rounded font-medium ${f.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {f.isActive ? 'On' : 'Off'}
              </button>
              <button onClick={() => openEdit(f)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded">
                <PencilSquareIcon className="w-4 h-4" />
              </button>
              <button onClick={() => deleteItem(f._id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTestimonials = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(t => (
        <div key={t._id} className={`bg-white rounded-xl border border-gray-200 p-4 ${!t.isActive && 'opacity-60'}`}>
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className={`w-4 h-4 ${i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
            ))}
          </div>
          <p className="text-sm text-gray-700 italic mb-3">"{t.message}"</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {t.avatar ? <img src={t.avatar} alt="" className="w-8 h-8 rounded-full object-cover" /> :
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                  {t.name[0]}
                </div>}
              <div>
                <p className="text-sm font-medium text-gray-900">{t.name}</p>
                {t.role && <p className="text-xs text-gray-500">{t.role}</p>}
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEdit(t)} className="p-1 text-gray-400 hover:text-indigo-600 rounded">
                <PencilSquareIcon className="w-4 h-4" />
              </button>
              <button onClick={() => deleteItem(t._id)} className="p-1 text-gray-400 hover:text-red-600 rounded">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderForm = () => {
    if (tab === 'banners') return (
      <div className="space-y-4">
        <div><label className="label-text">Title *</label>
          <input value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field w-full" /></div>
        <div><label className="label-text">Subtitle</label>
          <input value={form.subtitle || ''} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} className="input-field w-full" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label-text">CTA Text</label>
            <input value={form.ctaText || ''} onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))} className="input-field w-full" /></div>
          <div><label className="label-text">CTA URL</label>
            <input value={form.ctaUrl || ''} onChange={e => setForm(f => ({ ...f, ctaUrl: e.target.value }))} className="input-field w-full" /></div>
        </div>
        <div><label className="label-text">Image URL</label>
          <input value={form.image || ''} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="input-field w-full" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label-text">Bg Color</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={form.bgColor || '#1a237e'} onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))} className="w-10 h-10 rounded border cursor-pointer" />
              <input value={form.bgColor || '#1a237e'} onChange={e => setForm(f => ({ ...f, bgColor: e.target.value }))} className="input-field flex-1" />
            </div>
          </div>
          <div><label className="label-text">Order</label>
            <input type="number" value={form.order || 0} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} className="input-field w-full" /></div>
        </div>
      </div>
    );
    if (tab === 'faq') return (
      <div className="space-y-4">
        <div><label className="label-text">Question *</label>
          <input value={form.question || ''} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} className="input-field w-full" /></div>
        <div><label className="label-text">Answer *</label>
          <textarea rows={4} value={form.answer || ''} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} className="input-field w-full" /></div>
        <div><label className="label-text">Category</label>
          <input value={form.category || ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field w-full" placeholder="General, Shipping, Returns…" /></div>
      </div>
    );
    if (tab === 'testimonials') return (
      <div className="space-y-4">
        <div><label className="label-text">Customer Name *</label>
          <input value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field w-full" /></div>
        <div><label className="label-text">Role / Location</label>
          <input value={form.role || ''} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="input-field w-full" placeholder="Customer from Douala" /></div>
        <div><label className="label-text">Message *</label>
          <textarea rows={3} value={form.message || ''} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="input-field w-full" /></div>
        <div><label className="label-text">Rating</label>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setForm(f => ({ ...f, rating: n }))}
                className={`text-2xl ${n <= (form.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
            ))}
          </div>
        </div>
        <div><label className="label-text">Avatar URL</label>
          <input value={form.avatar || ''} onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))} className="input-field w-full" /></div>
      </div>
    );
    return (
      <div className="space-y-4">
        <div><label className="label-text">Title *</label>
          <input value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field w-full" /></div>
        <div><label className="label-text">Excerpt</label>
          <textarea rows={2} value={form.excerpt || ''} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} className="input-field w-full" /></div>
        <div><label className="label-text">Content *</label>
          <textarea rows={8} value={form.content || ''} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="input-field w-full font-mono text-sm" placeholder="Supports HTML markup" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label-text">Author</label>
            <input value={form.author || ''} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} className="input-field w-full" /></div>
          <div><label className="label-text">Status</label>
            <select value={form.status || 'draft'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input-field w-full">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <div><label className="label-text">Cover Image URL</label>
          <input value={form.coverImage || ''} onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))} className="input-field w-full" /></div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content</h1>
          <p className="text-sm text-gray-500">Manage banners, blog posts, FAQs, and testimonials</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Add {TABS.find(t => t.key === tab)?.label.replace('s', '')}
        </button>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${tab === t.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Icon className="w-4 h-4" />{t.label}
            </button>
          );
        })}
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> :
       items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p>No {TABS.find(t => t.key === tab)?.label.toLowerCase()} yet.</p>
          <button onClick={openCreate} className="mt-3 btn-primary text-sm">Add first one</button>
        </div>
       ) : (
        tab === 'banners' ? renderBanners() :
        tab === 'blog' ? renderBlog() :
        tab === 'faq' ? renderFAQ() : renderTestimonials()
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">{editId ? 'Edit' : 'New'} {TABS.find(t => t.key === tab)?.label.replace(/s$/, '')}</h2>
              <button onClick={() => setShowModal(false)}><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">{renderForm()}</div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end flex-shrink-0">
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
