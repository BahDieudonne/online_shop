import React, { useState } from 'react';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full font-semibold text-gray-700 mb-3">
        {title}
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && children}
    </div>
  );
};

const Stars = ({ count }) => (
  <span className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(i => {
      const Icon = i <= count ? StarSolid : StarOutline;
      return <Icon key={i} className={`w-3.5 h-3.5 ${i <= count ? 'text-amber-400' : 'text-gray-300'}`} />;
    })}
  </span>
);

export const ProductFilters = ({ filters, onChange, categories, brands }) => {
  const update = (key, value) => onChange({ ...filters, [key]: value, page: 1 });

  return (
    <div className="bg-white rounded-xl p-4 shadow-card sticky top-24">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 font-display">Filters</h3>
        <button onClick={() => onChange({ page: 1 })} className="text-xs text-brand-purple hover:underline flex items-center gap-1">
          <XMarkIcon className="w-3 h-3" /> Clear all
        </button>
      </div>

      <FilterSection title="Category">
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer hover:text-brand-purple">
            <input type="radio" name="category" value=""
              checked={!filters.category}
              onChange={() => update('category', '')}
              className="accent-brand-purple" />
            <span className="text-sm font-medium">All Categories</span>
          </label>
          {categories?.map(cat => (
            <label key={cat._id} className="flex items-center gap-2 cursor-pointer hover:text-brand-purple">
              <input type="radio" name="category" value={cat.slug}
                checked={filters.category === cat.slug}
                onChange={e => update('category', e.target.value)}
                className="accent-brand-purple" />
              <span className="text-sm">{cat.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div className="space-y-3">
          <div className="flex gap-2">
            <input type="number" placeholder="Min" value={filters.minPrice || ''}
              onChange={e => update('minPrice', e.target.value)}
              className="input text-sm py-2 px-3" />
            <input type="number" placeholder="Max" value={filters.maxPrice || ''}
              onChange={e => update('maxPrice', e.target.value)}
              className="input text-sm py-2 px-3" />
          </div>
          {[
            { label: 'Under 20,000', min: 0, max: 20000 },
            { label: '20,000 – 50,000', min: 20000, max: 50000 },
            { label: '50,000 – 100,000', min: 50000, max: 100000 },
            { label: 'Over 100,000', min: 100000, max: '' },
          ].map(r => (
            <button key={r.label}
              onClick={() => onChange({ ...filters, minPrice: r.min, maxPrice: r.max, page: 1 })}
              className={`text-sm w-full text-left px-2 py-1 rounded hover:bg-purple-50 hover:text-brand-purple transition-colors
                ${filters.minPrice == r.min && filters.maxPrice == r.max ? 'text-brand-purple font-medium' : 'text-gray-600'}`}>
              {r.label} FCFA
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Minimum Rating">
        {[5,4,3].map(r => (
          <button key={r} onClick={() => update('rating', filters.rating == r ? '' : r)}
            className={`flex items-center gap-2 text-sm w-full text-left mb-1 px-2 py-1 rounded transition-colors
              ${filters.rating == r ? 'text-brand-purple font-medium bg-purple-50' : 'text-gray-600 hover:text-brand-purple hover:bg-purple-50'}`}>
            <Stars count={r} />
            <span>& up</span>
          </button>
        ))}
      </FilterSection>

      <FilterSection title="Availability">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={filters.inStock === 'true'}
            onChange={e => update('inStock', e.target.checked ? 'true' : '')}
            className="accent-brand-purple" />
          <span className="text-sm text-gray-600">In Stock Only</span>
        </label>
      </FilterSection>

      {brands?.length > 0 && (
        <FilterSection title="Brand">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brands.map(brand => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer hover:text-brand-purple">
                <input type="radio" name="brand" value={brand}
                  checked={filters.brand === brand}
                  onChange={e => update('brand', e.target.value)}
                  className="accent-brand-purple" />
                <span className="text-sm">{brand}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  );
};

export default ProductFilters;
