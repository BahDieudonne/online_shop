import React from 'react';
import { ProductCard } from './ProductCard';
import { Pagination } from '../common/Pagination';

const SkeletonCard = () => (
  <div className="card overflow-hidden">
    <div className="skeleton aspect-square w-full" />
    <div className="p-3 space-y-2">
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-5 w-1/2" />
    </div>
  </div>
);

export const ProductGrid = ({
  products, loading, pagination, onPageChange,
  cols = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
}) => {
  if (loading) {
    return (
      <div className={`grid ${cols} gap-4`}>
        {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }
  if (!products?.length) {
    return (
      <div className="text-center py-20">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-600">No products found</h3>
        <p className="text-gray-400 mt-2">Try adjusting your filters or search terms</p>
      </div>
    );
  }
  return (
    <div>
      <div className={`grid ${cols} gap-4`}>
        {products.map(p => <ProductCard key={p._id} product={p} />)}
      </div>
      {pagination && (
        <Pagination
          page={pagination.page} pages={pagination.pages}
          total={pagination.total} limit={pagination.limit}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default ProductGrid;
