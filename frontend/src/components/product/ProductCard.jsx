import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartIcon, ShoppingCartIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';
import { toggleWishlist, selectIsWishlisted } from '../../redux/slices/wishlistSlice';
import { toggleCart } from '../../redux/slices/uiSlice';
import { StarRating } from '../common/StarRating';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';

export const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isWishlisted = useSelector(selectIsWishlisted(product._id));
  const { loading: cartLoading } = useSelector(s => s.cart);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!product.isInStock && !product.stock) return;
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
    dispatch(toggleCart());
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    dispatch(toggleWishlist(product._id));
  };

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const image = product.images?.[0]?.url || 'https://placehold.co/400x400?text=No+Image';

  return (
    <Link to={`/product/${product.slug}`} className="card group block animate-fade-in">
      {/* Image */}
      <div className="product-image-wrapper aspect-square relative">
        <img src={image} alt={product.name}
          className="w-full h-full object-cover rounded-t-xl"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=No+Image'; }}
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discountPercent > 0 && <Badge color="red">-{discountPercent}%</Badge>}
          {product.isNew && <Badge color="green">New</Badge>}
          {(!product.stock && product.stock !== undefined) && <Badge color="gray">Out of Stock</Badge>}
        </div>
        {/* Action overlay */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={handleWishlist}
            className={`p-2 rounded-full shadow-md transition-colors ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:text-red-500'}`}>
            {isWishlisted
              ? <HeartSolid className="w-4 h-4" />
              : <HeartIcon className="w-4 h-4" />}
          </button>
          <button
            className="p-2 rounded-full bg-white text-gray-600 shadow-md hover:text-brand-purple transition-colors"
            onClick={e => { e.preventDefault(); navigate(`/product/${product.slug}`); }}>
            <EyeIcon className="w-4 h-4" />
          </button>
        </div>
        {/* Quick add to cart */}
        <button onClick={handleAddToCart}
          disabled={cartLoading || (!product.stock && product.stock !== undefined)}
          className="absolute bottom-0 left-0 right-0 bg-brand-purple text-white py-2 text-sm font-semibold
                     opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
                     transition-all duration-200 flex items-center justify-center gap-2
                     disabled:bg-gray-400 disabled:cursor-not-allowed">
          <ShoppingCartIcon className="w-3.5 h-3.5" />
          {(!product.stock && product.stock !== undefined) ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
      {/* Info */}
      <div className="p-3">
        {product.brand && <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{product.brand}</p>}
        <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm leading-snug mb-2 group-hover:text-brand-purple transition-colors">
          {product.name}
        </h3>
        <StarRating rating={product.rating} showCount count={product.reviewCount} />
        <div className="flex items-center gap-2 mt-2">
          <span className="price-display text-base">
            {formatCurrency(product.discountPrice || product.price)}
          </span>
          {product.discountPrice && (
            <span className="price-original text-sm">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
