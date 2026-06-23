import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export const Pagination = ({ page, pages, total, limit, onPageChange }) => {
  if (!pages || pages <= 1) return null;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between mt-8">
      <p className="text-sm text-gray-600">Showing {start}–{end} of {total} results</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)} disabled={page === 1}
          className="p-2 rounded-lg border border-gray-300 hover:border-brand-purple disabled:opacity-40 transition"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        {Array.from({ length: Math.min(5, pages) }, (_, i) => {
          let pageNum = i + 1;
          if (pages > 5 && page > 3) pageNum = page - 2 + i;
          if (pageNum > pages) return null;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                pageNum === page
                  ? 'bg-brand-purple text-white'
                  : 'border border-gray-300 hover:border-brand-purple'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)} disabled={page === pages}
          className="p-2 rounded-lg border border-gray-300 hover:border-brand-purple disabled:opacity-40 transition"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
