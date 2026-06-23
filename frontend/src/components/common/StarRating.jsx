import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

export const StarRating = ({ rating = 0, size = 'sm', showCount, count, interactive, onChange }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(star => {
        const Icon = star <= rating ? StarSolid : StarOutline;
        return (
          <Icon
            key={star}
            className={`${sizes[size]} ${star <= rating ? 'text-amber-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => interactive && onChange?.(star)}
          />
        );
      })}
      {showCount && count !== undefined && (
        <span className="text-xs text-gray-500 ml-1">({count.toLocaleString()})</span>
      )}
    </div>
  );
};

export default StarRating;
