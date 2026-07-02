import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  HeartIcon, ShoppingCartIcon, TruckIcon, ShieldCheckIcon,
  ArrowsPointingOutIcon, CheckIcon, StarIcon, ChevronLeftIcon, ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist, selectIsWishlisted } from '../redux/slices/wishlistSlice';
import productService from '../services/productService';
import { formatCurrency } from '../utils/formatters';
import StarRating from '../components/common/StarRating';
import ProductGrid from '../components/product/ProductGrid';
import { PageLoader } from '../components/common/Spinner';
import Badge from '../components/common/Badge';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, body: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const isWishlisted = useSelector(product ? selectIsWishlisted(product._id) : () => false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [prodRes, relRes] = await Promise.all([
          productService.getProductBySlug(slug),
          productService.getProducts({ limit: 4 }),
        ]);
        // getProductBySlug returns the product object directly (backend does res.json(product))
        // getProducts returns { products: [...], pagination: {...} }
        const p = prodRes;
        setProduct(p);
        setRelated(relRes.products || []);
        if (p?.variants?.length > 0) setSelectedVariant(p.variants[0]);
        // Load reviews paginatedResponse returns { data: [reviews], pagination: {...} }
        const revRes = await productService.getProductReviews(p._id);
        setReviews(revRes.data || []);
        // Track view
        productService.trackProductView(p._id).catch(() => {});
      } catch {
        navigate('/404', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) return <PageLoader />;
  if (!product) return null;

  const price = selectedVariant?.price || product.discountPrice || product.price;
  const originalPrice = selectedVariant?.comparePrice || product.price;
  const stock = selectedVariant?.stock ?? product.stock;
  const discount = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const images = product.images || [];

  const handleAddToCart = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    dispatch(addToCart({ productId: product._id, quantity, variantId: selectedVariant?._id }));
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleWishlist = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    dispatch(toggleWishlist(product._id));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    setSubmittingReview(true);
    try {
      await productService.createReview(product._id, reviewForm);
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, body: '' });
      const revRes = await productService.getProductReviews(product._id);
      setReviews(revRes.data?.data?.reviews || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{product.name} CHANCELOR STORE</title>
        <meta name="description" content={product.shortDescription || product.description?.substring(0, 160)} />
        <meta property="og:title" content={product.name} />
        <meta property="og:image" content={images[0]?.url} />
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-navy-700">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-navy-700">Shop</Link>
          {product.category?.name && (
            <>
              <span>/</span>
              <Link to={`/shop?category=${product.category.slug}`} className="hover:text-navy-700">{product.category.name}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-800 line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image gallery */}
          <div>
            <div className="relative bg-gray-50 rounded-2xl overflow-hidden aspect-square mb-3 group">
              <img
                src={images[activeImage]?.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4">
                  <Badge variant="danger" size="lg">-{discount}%</Badge>
                </div>
              )}
              {stock === 0 && (
                <div className="absolute top-4 right-4">
                  <Badge variant="warning" size="lg">Pre-order</Badge>
                </div>
              )}
              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveImage((prev) => (prev + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${i === activeImage ? 'border-navy-600' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img src={img.thumbnail || img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-5">
            <div>
              {product.brand && <p className="text-sm text-purple-600 font-semibold mb-1">{product.brand}</p>}
              <h1 className="font-display text-2xl md:text-3xl font-bold text-navy-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <StarRating rating={product.ratings?.average || 0} readonly size="sm" />
                <span className="text-sm text-gray-500">({reviews.length} reviews)</span>
                {product.analytics?.totalSales > 0 && (
                  <span className="text-sm text-gray-400">· {product.analytics.totalSales} sold</span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-navy-800">{formatCurrency(price)}</span>
              {discount > 0 && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatCurrency(originalPrice)}</span>
                  <Badge variant="danger">Save {discount}%</Badge>
                </>
              )}
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-gray-600 leading-relaxed">{product.shortDescription}</p>
            )}

            {/* Variants */}
            {product.variants?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Select Option:</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v._id}
                      onClick={() => setSelectedVariant(v)}
                      disabled={v.stock === 0}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                        selectedVariant?._id === v._id
                          ? 'border-navy-600 bg-navy-600 text-white'
                          : v.stock === 0
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
                          : 'border-gray-300 hover:border-navy-400 text-gray-700'
                      }`}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="px-4 py-2.5 hover:bg-gray-100 transition-colors text-lg font-bold">−</button>
                <span className="px-6 py-2.5 font-semibold border-x border-gray-300">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(stock > 0 ? stock : 99, q + 1))} className="px-4 py-2.5 hover:bg-gray-100 transition-colors text-lg font-bold">+</button>
              </div>
              <span className={`text-sm font-medium ${stock > 0 ? 'text-green-600' : 'text-purple-600'}`}>
                {stock > 0 ? `${stock} in stock` : 'Pre-order available'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 btn-primary flex items-center justify-center gap-2 py-3"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                {stock === 0 ? 'Pre-order' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 btn-gold flex items-center justify-center gap-2 py-3 font-bold"
              >
                {stock === 0 ? 'Pre-order Now' : 'Buy Now'}
              </button>
              <button
                onClick={handleWishlist}
                className={`p-3 rounded-xl border transition-all ${isWishlisted ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-300 hover:border-red-300 hover:text-red-400 text-gray-500'}`}
              >
                {isWishlisted ? <HeartSolid className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
              </button>
            </div>

            {/* Trust signals */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {stock === 0 && (
                <div className="flex items-center gap-2 text-sm text-purple-700 font-medium pb-1 border-b border-gray-200 mb-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Pre-order contact us after placing to arrange payment and delivery date
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TruckIcon className="w-4 h-4 text-green-500" />
                Free delivery on orders over 50,000 FCFA
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ShieldCheckIcon className="w-4 h-4 text-navy-600" />
                30-day return policy
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckIcon className="w-4 h-4 text-purple-600" />
                Authentic product 100% guaranteed
              </div>
            </div>

            {/* Share */}
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>Share:</span>
              <a href={`https://wa.me/?text=${encodeURIComponent(product.name + ' ' + window.location.href)}`} target="_blank" rel="noopener noreferrer"
                className="text-green-600 hover:text-green-700 font-medium">WhatsApp</a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium">Facebook</a>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="flex border-b border-gray-200 gap-6">
            {['description', 'specifications', 'reviews'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
                  tab === t ? 'border-navy-700 text-navy-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t} {t === 'reviews' && `(${reviews.length})`}
              </button>
            ))}
          </div>

          <div className="py-6">
            {tab === 'description' && (
              <div className="prose max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description || '<p>No description available.</p>' }}
              />
            )}

            {tab === 'specifications' && (
              <div className="grid md:grid-cols-2 gap-3">
                {product.specifications?.length > 0 ? (
                  product.specifications.map((spec, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600 w-36 flex-shrink-0">{spec.key}</span>
                      <span className="text-sm text-gray-800">{spec.value}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No specifications available.</p>
                )}
              </div>
            )}

            {tab === 'reviews' && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="flex items-center gap-6 bg-gray-50 rounded-xl p-5">
                  <div className="text-center">
                    <div className="font-display text-5xl font-bold text-navy-800">{(product.ratings?.average || 0).toFixed(1)}</div>
                    <StarRating rating={product.ratings?.average || 0} readonly size="sm" />
                    <div className="text-xs text-gray-500 mt-1">{reviews.length} reviews</div>
                  </div>
                </div>

                {/* Review list */}
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <div key={r._id} className="bg-white border border-gray-100 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-sm text-gray-800">{r.customer?.firstName} {r.customer?.lastName}</div>
                          {r.isVerifiedPurchase && <Badge variant="success" size="sm">Verified Purchase</Badge>}
                        </div>
                        <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <StarRating rating={r.rating} readonly size="sm" />
                      <p className="text-sm text-gray-700 mt-2 leading-relaxed">{r.body}</p>
                    </div>
                  ))}
                </div>

                {/* Write review */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-800 mb-4">Write a Review</h3>
                  {isAuthenticated ? (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Your Rating</label>
                        <StarRating rating={reviewForm.rating} onChange={(r) => setReviewForm((f) => ({ ...f, rating: r }))} size="lg" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Your Review</label>
                        <textarea
                          value={reviewForm.body}
                          onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
                          rows={4}
                          required
                          placeholder="Share your experience with this product..."
                          className="input resize-none"
                        />
                      </div>
                      <button type="submit" disabled={submittingReview} className="btn-primary px-6 py-2.5">
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  ) : (
                    <p className="text-sm text-gray-600">
                      <Link to="/login" className="text-navy-600 font-semibold hover:underline">Sign in</Link> to write a review.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-navy-800 mb-6">You May Also Like</h2>
            <ProductGrid products={related} cols={4} />
          </section>
        )}
      </div>
    </>
  );
};

export default ProductDetailPage;
