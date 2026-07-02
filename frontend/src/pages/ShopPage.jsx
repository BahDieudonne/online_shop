import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AdjustmentsHorizontalIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilters from '../components/product/ProductFilters';
import Pagination from '../components/common/Pagination';
import api from '../services/api';

const SORT_OPTIONS = [
  { label: 'Relevance', value: '' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Best Rating', value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
];

const ShopPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: products, pagination, loading } = useSelector((s) => s.products);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories').then(res => {
      // Flatten tree into a single level list for the filter sidebar
      const flat = [];
      const walk = (list) => list.forEach(c => { flat.push(c); if (c.children?.length) walk(c.children); });
      walk(res.data.data || []);
      setCategories(flat);
    }).catch(() => {});
  }, []);

  const currentPage = parseInt(searchParams.get('page') || '1');
  const sortBy = searchParams.get('sort') || '';
  const category = searchParams.get('category') || '';
  const search = searchParams.get('q') || '';
  const filter = searchParams.get('filter') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const rating = searchParams.get('rating') || '';

  const loadProducts = useCallback(() => {
    const params = { page: currentPage, limit: 20 };
    if (sortBy) {
      const [field, order] = sortBy.split('-');
      params.sortBy = field === 'newest' ? 'createdAt' : field === 'popular' ? 'analytics.views' : field === 'rating' ? 'ratings.average' : 'discountPrice';
      params.sortOrder = order === 'asc' ? 'asc' : 'desc';
    }
    if (category) params.category = category;
    if (search) params.search = search;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (rating) params.minRating = rating;
    if (filter === 'featured') params.featured = true;
    if (filter === 'new-arrivals') params.sortBy = 'createdAt';
    if (filter === 'best-sellers') params.sortBy = 'analytics.totalSales';
    if (filter === 'flash-sale') params.onSale = true;
    dispatch(fetchProducts(params));
  }, [dispatch, currentPage, sortBy, category, search, minPrice, maxPrice, rating, filter]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const getTitle = () => {
    if (search) return `Results for "${search}"`;
    if (filter === 'flash-sale') return 'Flash Sale';
    if (filter === 'new-arrivals') return 'New Arrivals';
    if (filter === 'best-sellers') return 'Best Sellers';
    if (category) {
      const match = categories.find(c => c._id === category || c.slug === category);
      return match ? match.name : category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return 'All Products';
  };

  return (
    <>
      <Helmet>
        <title>{getTitle()} CHANCELOR STORE</title>
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-bold text-navy-800">{getTitle()}</h1>
            {pagination?.total > 0 && (
              <p className="text-sm text-gray-500 mt-1">{pagination.total} products found</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="input text-sm py-2 pr-8"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {/* Filter toggle mobile */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="lg:hidden flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              Filters
            </button>
            {/* View mode */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-navy-700 text-white' : 'hover:bg-gray-50'}`}>
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-navy-700 text-white' : 'hover:bg-gray-50'}`}>
                <ListBulletIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className={`w-64 flex-shrink-0 ${filtersOpen ? 'block' : 'hidden'} lg:block`}>
            <ProductFilters
              filters={{ category, minPrice, maxPrice, rating }}
              categories={categories}
              onChange={(updated) => {
                const next = new URLSearchParams(searchParams);
                Object.entries(updated).forEach(([k, v]) => {
                  if (v !== undefined && v !== '' && k !== 'page') next.set(k, String(v));
                  else next.delete(k);
                });
                next.delete('page');
                setSearchParams(next);
              }}
            />
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0">
            <ProductGrid
              products={products}
              loading={loading.fetch}
              cols={viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}
            />
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={(p) => updateParam('page', p)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopPage;
