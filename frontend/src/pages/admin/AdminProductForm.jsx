import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PlusIcon, TrashIcon, PhotoIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import productService from '../../services/productService';
import { Spinner } from '../../components/common/Spinner';

const STATUSES = ['draft', 'published', 'scheduled', 'archived'];
const CONDITIONS = ['new', 'used', 'refurbished'];

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const imgInputRef = useRef();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', shortDescription: '',
    category: '', brand: '', sku: '', barcode: '',
    price: '', discountPrice: '', costPrice: '',
    stock: '', weight: '', condition: 'new',
    tags: '', status: 'draft', featured: false,
    features: [''], specifications: [{ key: '', value: '' }],
    images: [], variants: [],
  });

  useEffect(() => {
    productService.getCategories({ admin: true }).then((r) => setCategories(r.data?.data || [])).catch(() => {});
    if (isEdit) {
      productService.getProductById(id).then((r) => {
        const p = r.data?.data;
        if (p) setForm({
          ...p,
          category: p.category?._id || '',
          tags: (p.tags || []).join(', '),
          features: p.features?.length ? p.features : [''],
          specifications: p.specifications?.length ? p.specifications : [{ key: '', value: '' }],
        });
      }).catch(() => toast.error('Failed to load product'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleImageUpload = async (files) => {
    if (!files.length) return;
    setUploadingImages(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append('images', f));
      const res = await productService.uploadImages(formData);
      const newImages = Array.isArray(res.data?.data) ? res.data.data : [];
      set('images', [...form.images, ...newImages]);
      toast.success(`${newImages.length} image(s) uploaded`);
    } catch { toast.error('Image upload failed'); }
    finally { setUploadingImages(false); }
  };

  const removeImage = (i) => set('images', form.images.filter((_, idx) => idx !== i));
  const moveImage = (from, to) => {
    const imgs = [...form.images];
    [imgs[from], imgs[to]] = [imgs[to], imgs[from]];
    set('images', imgs);
  };

  const addVariant = () => set('variants', [...form.variants, { name: '', sku: '', price: '', stock: 0, images: [] }]);
  const updateVariant = (i, key, val) => {
    const v = [...form.variants];
    v[i] = { ...v[i], [key]: val };
    set('variants', v);
  };
  const removeVariant = (i) => set('variants', form.variants.filter((_, idx) => idx !== i));

  const addSpec = () => set('specifications', [...form.specifications, { key: '', value: '' }]);
  const updateSpec = (i, key, val) => {
    const s = [...form.specifications];
    s[i] = { ...s[i], [key]: val };
    set('specifications', s);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) { toast.error('Name and price are required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        specifications: form.specifications.filter((s) => s.key && s.value),
        features: form.features.filter(Boolean),
      };
      if (isEdit) {
        await productService.updateProduct(id, payload);
        toast.success('Product updated!');
      } else {
        await productService.createProduct(payload);
        toast.success('Product created!');
        navigate('/admin/products');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Spinner size="xl" /></div>;

  const F = (key) => ({ value: form[key], onChange: (e) => set(key, e.target.value) });

  return (
    <>
      <Helmet><title>{isEdit ? 'Edit Product' : 'New Product'} Admin | CHANCELOR STORE</title></Helmet>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/admin/products')} className="text-gray-400 hover:text-gray-600">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="font-display text-2xl font-bold text-navy-900">{isEdit ? 'Edit Product' : 'New Product'}</h1>
          </div>
          <div className="flex gap-2">
            <select {...F('status')} className="input text-sm py-2">
              {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <button type="submit" disabled={saving} className="btn-primary px-6 py-2 font-semibold">
              {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Basic info */}
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-navy-800">Basic Information</h2>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Product Name *</label>
                <input type="text" required className="input" placeholder="e.g. Samsung Galaxy A54" {...F('name')} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Short Description</label>
                <input type="text" className="input" placeholder="Brief product summary (shown in listings)" {...F('shortDescription')} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Full Description</label>
                <textarea rows={6} className="input resize-none" placeholder="Detailed product description (HTML supported)" {...F('description')} />
              </div>
            </div>

            {/* Images */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-navy-800">Product Images</h2>
                <button type="button" onClick={() => imgInputRef.current?.click()}
                  disabled={uploadingImages}
                  className="btn-secondary flex items-center gap-1.5 text-sm px-3 py-2">
                  {uploadingImages ? <Spinner size="sm" /> : <PhotoIcon className="w-4 h-4" />}
                  {uploadingImages ? 'Uploading...' : 'Upload Images'}
                </button>
                <input ref={imgInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files)} />
              </div>
              {form.images.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 cursor-pointer hover:border-navy-300 transition-colors"
                  onClick={() => imgInputRef.current?.click()}>
                  <PhotoIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Click or drag images here (JPG, PNG, WEBP)</p>
                  <p className="text-xs mt-1">First image is the main product image</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                  {form.images.map((img, i) => (
                    <div key={i} className={`relative group rounded-xl overflow-hidden aspect-square ${i === 0 ? 'ring-2 ring-navy-500' : ''}`}>
                      <img src={img.thumbnail || img.url} alt="" className="w-full h-full object-cover" />
                      {i === 0 && <div className="absolute top-0 left-0 right-0 bg-navy-600 text-white text-[9px] text-center py-0.5">Main</div>}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        {i > 0 && <button type="button" onClick={() => moveImage(i, i - 1)} className="text-white text-xs bg-white/20 rounded px-1">←</button>}
                        <button type="button" onClick={() => removeImage(i)} className="text-white">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        {i < form.images.length - 1 && <button type="button" onClick={() => moveImage(i, i + 1)} className="text-white text-xs bg-white/20 rounded px-1">→</button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing & Inventory */}
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-navy-800">Pricing & Inventory</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Price (FCFA) *</label>
                  <input type="number" required min="0" className="input" placeholder="25000" {...F('price')} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Discount Price</label>
                  <input type="number" min="0" className="input" placeholder="20000" {...F('discountPrice')} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Cost Price</label>
                  <input type="number" min="0" className="input" placeholder="15000" {...F('costPrice')} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Stock Quantity *</label>
                  <input type="number" required min="0" className="input" placeholder="100" {...F('stock')} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">SKU</label>
                  <input type="text" className="input" placeholder="SKU-001" {...F('sku')} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Barcode</label>
                  <input type="text" className="input" placeholder="1234567890" {...F('barcode')} />
                </div>
              </div>
            </div>

            {/* Variants */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-navy-800">Product Variants</h2>
                <button type="button" onClick={addVariant} className="btn-secondary flex items-center gap-1 text-sm px-3 py-1.5">
                  <PlusIcon className="w-3.5 h-3.5" /> Add Variant
                </button>
              </div>
              {form.variants.length === 0 ? (
                <p className="text-sm text-gray-400">No variants yet. Add variants for options like color, size, or storage.</p>
              ) : (
                <div className="space-y-3">
                  {form.variants.map((v, i) => (
                    <div key={i} className="grid grid-cols-4 gap-3 bg-gray-50 rounded-xl p-3 items-center">
                      <input type="text" placeholder="Variant name (e.g. Black 128GB)" value={v.name} onChange={(e) => updateVariant(i, 'name', e.target.value)} className="input text-sm col-span-2" />
                      <input type="number" placeholder="Price" value={v.price} onChange={(e) => updateVariant(i, 'price', e.target.value)} className="input text-sm" />
                      <div className="flex items-center gap-2">
                        <input type="number" placeholder="Stock" value={v.stock} onChange={(e) => updateVariant(i, 'stock', e.target.value)} className="input text-sm flex-1" />
                        <button type="button" onClick={() => removeVariant(i)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-navy-800">Specifications</h2>
                <button type="button" onClick={addSpec} className="btn-secondary flex items-center gap-1 text-sm px-3 py-1.5">
                  <PlusIcon className="w-3.5 h-3.5" /> Add Spec
                </button>
              </div>
              <div className="space-y-2">
                {form.specifications.map((s, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input type="text" placeholder="Key (e.g. RAM)" value={s.key} onChange={(e) => updateSpec(i, 'key', e.target.value)} className="input text-sm flex-1" />
                    <input type="text" placeholder="Value (e.g. 8GB)" value={s.value} onChange={(e) => updateSpec(i, 'value', e.target.value)} className="input text-sm flex-1" />
                    <button type="button" onClick={() => set('specifications', form.specifications.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 flex-shrink-0">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">
            {/* Organization */}
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-navy-800">Organization</h2>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
                <select className="input" {...F('category')}>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Brand</label>
                <input type="text" className="input" placeholder="e.g. Samsung" {...F('brand')} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Condition</label>
                <select className="input" {...F('condition')}>
                  {CONDITIONS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Tags (comma-separated)</label>
                <input type="text" className="input" placeholder="electronics, phone, samsung" {...F('tags')} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Weight (kg)</label>
                <input type="number" step="0.01" min="0" className="input" placeholder="0.5" {...F('weight')} />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="accent-navy-700" />
                <span className="text-sm text-gray-700 font-medium">Featured Product</span>
              </label>
            </div>

            {/* Features */}
            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-navy-800">Key Features</h2>
                <button type="button" onClick={() => set('features', [...form.features, ''])} className="text-navy-600 text-xs font-medium">+ Add</button>
              </div>
              {form.features.map((feat, i) => (
                <div key={i} className="flex gap-2">
                  <input type="text" value={feat} onChange={(e) => {
                    const f = [...form.features]; f[i] = e.target.value; set('features', f);
                  }} className="input text-sm flex-1" placeholder={`Feature ${i + 1}`} />
                  <button type="button" onClick={() => set('features', form.features.filter((_, idx) => idx !== i))} className="text-red-400">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-secondary px-6 py-2.5">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary px-8 py-2.5 font-semibold">
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </>
  );
};

export default AdminProductForm;
