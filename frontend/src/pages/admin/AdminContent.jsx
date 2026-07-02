import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon, PencilSquareIcon, TrashIcon, PhotoIcon,
  DocumentTextIcon, QuestionMarkCircleIcon, StarIcon, XMarkIcon,
  GlobeAltIcon, BookOpenIcon, ChartBarIcon, LightBulbIcon,
  PhoneIcon, DevicePhoneMobileIcon, UsersIcon, BoltIcon,
  SparklesIcon, ShieldCheckIcon, HeartIcon, CheckBadgeIcon,
  TruckIcon, CreditCardIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner';
import ImagePicker from '../../components/common/ImagePicker';
import { formatDate } from '../../utils/formatters';
import api from '../../services/api';

const TABS = [
  { key: 'banners', label: 'Banners', icon: PhotoIcon },
  { key: 'blog', label: 'Blog Posts', icon: DocumentTextIcon },
  { key: 'faq', label: 'FAQs', icon: QuestionMarkCircleIcon },
  { key: 'testimonials', label: 'Testimonials', icon: StarIcon },
  { key: 'pages', label: 'Pages', icon: GlobeAltIcon },
];

const BLANK_BANNER = { title: '', subtitle: '', ctaText: '', ctaUrl: '', image: '', bgColor: '#1a237e', isActive: true, order: 0 };
const BLANK_FAQ = { question: '', answer: '', category: 'General', isActive: true, order: 0 };
const BLANK_TESTIMONIAL = { name: '', role: '', message: '', rating: 5, avatar: '', isActive: true };

const VALUE_ICON_OPTIONS = [
  { key: 'users',    Icon: UsersIcon,      label: 'Users / Trust' },
  { key: 'bolt',     Icon: BoltIcon,       label: 'Bolt / Speed' },
  { key: 'sparkles', Icon: SparklesIcon,   label: 'Sparkles / Quality' },
  { key: 'shield',   Icon: ShieldCheckIcon,label: 'Shield / Security' },
  { key: 'heart',    Icon: HeartIcon,      label: 'Heart' },
  { key: 'star',     Icon: StarIcon,       label: 'Star' },
  { key: 'check',    Icon: CheckBadgeIcon, label: 'Badge / Check' },
  { key: 'truck',    Icon: TruckIcon,      label: 'Truck / Delivery' },
  { key: 'credit',   Icon: CreditCardIcon, label: 'Card / Payment' },
];

const VALUE_ICON_MAP = Object.fromEntries(VALUE_ICON_OPTIONS.map(o => [o.key, o.Icon]));

const PAGE_DEFAULTS = {
  about: {
    story: { heading: 'Our Story', body: 'CHANCELOR STORE was born from a simple vision: make online shopping accessible, reliable, and enjoyable for everyone in Cameroon.' },
    mission: { heading: 'Our Mission', body: 'Offer quality products at competitive prices, with fast delivery across Cameroon.' },
    vision: { heading: 'Our Vision', body: 'Become the leading e-commerce platform in Central Africa.' },
    stats: [
      { label: 'Happy Customers', value: '5,000+' },
      { label: 'Products Available', value: '1,000+' },
      { label: 'Cities Served', value: '10+' },
      { label: 'Years of Experience', value: '2+' },
    ],
    values: [
      { icon: 'users',    title: 'Trust',    desc: 'Lasting relationships built on honesty.' },
      { icon: 'bolt',     title: 'Speed',    desc: 'Express delivery across Cameroon.' },
      { icon: 'sparkles', title: 'Quality',  desc: 'Only the best products selected.' },
      { icon: 'shield',   title: 'Security', desc: 'Secure payments and guaranteed returns.' },
    ],
  },
  contact: {
    phone: '+237 674 962 803',
    email: 'support@chancelorstore.cm',
    address: 'Douala, Cameroun',
    hours: 'Lun - Sam : 8h00 - 20h00',
    whatsapp: '237674962803',
    mapEmbed: '',
    social: { facebook: '', instagram: '', twitter: '' },
  },
};

export default function AdminContent() {
  const [tab, setTab] = useState('banners');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Pages editor state
  const [pageName, setPageName] = useState('about');
  const [pageContent, setPageContent] = useState({});
  const [pageSaving, setPageSaving] = useState(false);

  const endpointMap = {
    banners: '/content/banners',
    blog: '/blog',
    faq: '/content/faqs',
    testimonials: '/content/testimonials',
  };

  const fetchItems = useCallback(async () => {
    if (tab === 'pages') return;
    try {
      setLoading(true);
      const res = await api.get(`${endpointMap[tab]}?admin=true`);
      setItems(res.data.data || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, [tab]);

  const fetchPage = useCallback(async (name) => {
    try {
      const res = await api.get(`/settings/page-${name}`);
      setPageContent({ ...PAGE_DEFAULTS[name], ...(res.data?.data || {}) });
    } catch {
      setPageContent({ ...PAGE_DEFAULTS[name] });
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { if (tab === 'pages') fetchPage(pageName); }, [tab, pageName, fetchPage]);

  // Page editor helpers
  const setNestedField = (path, val) => {
    setPageContent(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let curr = next;
      for (let i = 0; i < parts.length - 1; i++) curr = curr[parts[i]];
      curr[parts[parts.length - 1]] = val;
      return next;
    });
  };

  const updateArrayItem = (arrayKey, index, field, val) => {
    setPageContent(prev => {
      const arr = [...(prev[arrayKey] || [])];
      arr[index] = { ...arr[index], [field]: val };
      return { ...prev, [arrayKey]: arr };
    });
  };

  const savePage = async () => {
    setPageSaving(true);
    try {
      await api.put(`/settings/page-${pageName}`, pageContent);
      toast.success(`${pageName === 'about' ? 'About' : 'Contact'} page saved!`);
    } catch {
      toast.error('Failed to save page');
    } finally {
      setPageSaving(false);
    }
  };

  // Standard CRUD
  const openCreate = () => {
    const blank = tab === 'banners' ? BLANK_BANNER : tab === 'faq' ? BLANK_FAQ : tab === 'testimonials' ? BLANK_TESTIMONIAL : {};
    setForm(blank); setEditId(null); setShowModal(true);
  };

  const openEdit = (item) => {
    // Blog posts store coverImage as { url } object flatten to string for the form
    const normalised = { ...item };
    if (tab === 'blog' && item.coverImage?.url) normalised.coverImage = item.coverImage.url;
    setForm(normalised);
    setEditId(item._id);
    setShowModal(true);
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

  // ── Renderers ──────────────────────────────────────────────────────────────

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
                <span className="mt-2 inline-block bg-white text-indigo-700 text-xs px-3 py-1 rounded-full w-fit font-medium">{b.ctaText}</span>
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
          {(post.coverImage?.url || post.coverImage) && (
            <img src={post.coverImage?.url || post.coverImage} alt="" className="w-20 h-16 rounded-lg object-cover border flex-shrink-0" />
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
                  {t.name?.[0] ?? '?'}
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
        <ImagePicker label="Banner Image" value={form.image} onChange={url => setForm(f => ({ ...f, image: url }))} />
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
              <button key={n} type="button" onClick={() => setForm(f => ({ ...f, rating: n }))}
                className={`text-2xl ${n <= (form.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
            ))}
          </div>
        </div>
        <ImagePicker label="Avatar" value={form.avatar} onChange={url => setForm(f => ({ ...f, avatar: url }))} />
      </div>
    );
    // Blog
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
        <ImagePicker label="Cover Image" value={form.coverImage} onChange={url => setForm(f => ({ ...f, coverImage: url }))} />
      </div>
    );
  };

  const renderPages = () => (
    <div className="space-y-6">

      {/* Sub-tab picker */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        {[{ key: 'about', label: 'About Us' }, { key: 'contact', label: 'Contact Us' }].map(p => (
          <button key={p.key} onClick={() => setPageName(p.key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${pageName === p.key ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* ── About editor ── */}
      {pageName === 'about' && (
        <div className="space-y-5">

          {/* Story */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wide flex items-center gap-2"><BookOpenIcon className="w-4 h-4" /> Story Section</h3>
            <div>
              <label className="label-text">Section Heading</label>
              <input value={pageContent.story?.heading || ''} onChange={e => setNestedField('story.heading', e.target.value)} className="input-field w-full" />
            </div>
            <div>
              <label className="label-text">Body Text</label>
              <textarea rows={4} value={pageContent.story?.body || ''} onChange={e => setNestedField('story.body', e.target.value)} className="input-field w-full" />
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { key: 'mission', label: 'Mission' },
              { key: 'vision',  label: 'Vision' },
            ].map(({ key, label }) => (
              <div key={key} className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
                <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wide">{label}</h3>
                <div>
                  <label className="label-text">Heading</label>
                  <input value={pageContent[key]?.heading || ''} onChange={e => setNestedField(`${key}.heading`, e.target.value)} className="input-field w-full" />
                </div>
                <div>
                  <label className="label-text">Body Text</label>
                  <textarea rows={3} value={pageContent[key]?.body || ''} onChange={e => setNestedField(`${key}.body`, e.target.value)} className="input-field w-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wide mb-4 flex items-center gap-2"><ChartBarIcon className="w-4 h-4" /> Stats Bar (4 items)</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(pageContent.stats || []).map((s, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-400">Stat {i + 1}</p>
                  <input
                    placeholder="Value (e.g. 5 000+)"
                    value={s.value || ''}
                    onChange={e => updateArrayItem('stats', i, 'value', e.target.value)}
                    className="input-field w-full text-center font-bold"
                  />
                  <input
                    placeholder="Label"
                    value={s.label || ''}
                    onChange={e => updateArrayItem('stats', i, 'label', e.target.value)}
                    className="input-field w-full text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Values */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wide mb-4 flex items-center gap-2"><LightBulbIcon className="w-4 h-4" /> Our Values (4 cards)</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {(pageContent.values || []).map((v, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="label-text">Icon</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {VALUE_ICON_OPTIONS.map(opt => {
                        const Ico = opt.Icon;
                        return (
                          <button key={opt.key} type="button" title={opt.label}
                            onClick={() => updateArrayItem('values', i, 'icon', opt.key)}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center border-2 transition-all ${v.icon === opt.key ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-400 hover:border-indigo-300'}`}>
                            <Ico className="w-4 h-4" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="label-text">Title</label>
                    <input value={v.title || ''} onChange={e => updateArrayItem('values', i, 'title', e.target.value)} className="input-field w-full" />
                  </div>
                  <div>
                    <label className="label-text">Description</label>
                    <textarea rows={2} value={v.desc || ''} onChange={e => updateArrayItem('values', i, 'desc', e.target.value)} className="input-field w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Contact editor ── */}
      {pageName === 'contact' && (
        <div className="space-y-5">

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wide mb-4 flex items-center gap-2"><PhoneIcon className="w-4 h-4" /> Contact Info</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { key: 'phone', label: 'Phone', placeholder: '+237 674 962 803' },
                { key: 'email', label: 'Email', placeholder: 'support@chancelorstore.cm' },
                { key: 'address', label: 'Address', placeholder: 'Douala, Cameroun' },
                { key: 'hours', label: 'Business Hours', placeholder: 'Lun - Sam : 8h00 - 20h00' },
                { key: 'whatsapp', label: 'WhatsApp (digits only)', placeholder: '237674962803' },
                { key: 'mapEmbed', label: 'Google Maps Embed URL', placeholder: 'https://maps.google.com/...' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="label-text">{label}</label>
                  <input
                    value={pageContent[key] || ''}
                    onChange={e => setPageContent(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="input-field w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wide mb-4 flex items-center gap-2"><DevicePhoneMobileIcon className="w-4 h-4" /> Social Media Links</h3>
            <div className="space-y-3">
              {[
                { net: 'facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/yourpage' },
                { net: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/yourhandle' },
                { net: 'twitter', label: 'Twitter / X URL', placeholder: 'https://twitter.com/yourhandle' },
              ].map(({ net, label, placeholder }) => (
                <div key={net}>
                  <label className="label-text">{label}</label>
                  <input
                    value={pageContent.social?.[net] || ''}
                    onChange={e => setPageContent(p => ({ ...p, social: { ...(p.social || {}), [net]: e.target.value } }))}
                    placeholder={placeholder}
                    className="input-field w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save button */}
      <div className="flex justify-end pt-2">
        <button onClick={savePage} disabled={pageSaving} className="btn-primary flex items-center gap-2 px-6">
          {pageSaving && <Spinner size="sm" />}
          Save {pageName === 'about' ? 'About' : 'Contact'} Page
        </button>
      </div>
    </div>
  );

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content</h1>
          <p className="text-sm text-gray-500">Manage banners, blog posts, FAQs, testimonials and static pages</p>
        </div>
        {tab !== 'pages' && (
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" /> Add {TABS.find(t => t.key === tab)?.label.replace(/s$/, '')}
          </button>
        )}
      </div>

      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0
                ${tab === t.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Icon className="w-4 h-4" />{t.label}
            </button>
          );
        })}
      </div>

      {tab === 'pages' ? renderPages() :
       loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> :
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
