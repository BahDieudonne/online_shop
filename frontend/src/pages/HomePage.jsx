import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRightIcon, SparklesIcon, TruckIcon, ShieldCheckIcon, PhoneIcon,
  TrophyIcon, FireIcon, TagIcon, DevicePhoneMobileIcon,
  HomeIcon, ShoppingBagIcon, BookOpenIcon, PuzzlePieceIcon,
  CakeIcon, FolderIcon,
} from '@heroicons/react/24/outline';
import { fetchFeatured, fetchNewArrivals, fetchBestSellers } from '../store/slices/productSlice';
import ProductGrid from '../components/product/ProductGrid';
import ReviewsSection from '../components/common/ReviewsSection';
import { formatCurrency } from '../utils/formatters';
import api from '../services/api';

const BANNERS = [
  {
    title: 'New Season Arrivals',
    subtitle: 'Discover the latest trends in fashion & electronics',
    cta: 'Shop Now',
    link: '/shop?filter=new-arrivals',
    bg: 'from-navy-800 via-navy-700 to-purple-800',
    BadgeIcon: TagIcon,
    badgeText: 'Just Landed',
  },
  {
    title: 'Flash Sale Up to 60% Off',
    subtitle: "Limited time deals on top brands. Grab them before they're gone!",
    cta: 'View Deals',
    link: '/shop?filter=flash-sale',
    bg: 'from-red-700 via-red-600 to-orange-600',
    BadgeIcon: FireIcon,
    badgeText: 'Today Only',
  },
  {
    title: 'Pay with MTN or Orange',
    subtitle: 'Fast, secure mobile money payments for every Cameroonian',
    cta: 'Learn More',
    link: '/about',
    bg: 'from-gold-600 via-gold-500 to-yellow-500',
    BadgeIcon: DevicePhoneMobileIcon,
    badgeText: 'Mobile Money',
  },
];

const PERKS = [
  { icon: TruckIcon,       title: 'Fast Delivery',        desc: 'Express delivery across Cameroon' },
  { icon: ShieldCheckIcon, title: 'Secure Payment',       desc: 'MTN, Orange, Stripe & more' },
  { icon: PhoneIcon,       title: '24/7 Support',         desc: 'Always here to help you' },
  { icon: SparklesIcon,    title: 'Quality Guaranteed',   desc: '100% authentic products' },
];

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [heroBanner, setHeroBanner] = useState(0);
  const [categories, setCategories] = useState([]);
  const { featured, newArrivals, bestSellers, loading } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchFeatured());
    dispatch(fetchNewArrivals());
    dispatch(fetchBestSellers());
    api.get('/categories').then(res => {
      const flat = [];
      const walk = (list) => list.forEach(c => { flat.push(c); if (c.children?.length) walk(c.children); });
      walk(res.data.data || []);
      setCategories(flat);
    }).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(() => setHeroBanner((prev) => (prev + 1) % BANNERS.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const banner = BANNERS[heroBanner];

  return (
    <>
      <Helmet>
        <title>CHANCELOR STORE Shop Online in Cameroon</title>
        <meta name="description" content="Cameroon's premier online store. Shop electronics, fashion, home goods and more. Fast delivery, mobile money payment accepted." />
        <meta property="og:title" content="CHANCELOR STORE Shop Online in Cameroon" />
        <meta property="og:description" content="Quality products, fast delivery, MTN & Orange Money accepted." />
      </Helmet>

      {/* Hero */}
      <section className={`relative bg-gradient-to-br ${banner.bg} text-white overflow-hidden transition-all duration-700`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-3 py-1 rounded-full mb-4">
              <banner.BadgeIcon className="w-4 h-4" />
              {banner.badgeText}
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-4">
              {banner.title}
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg">
              {banner.subtitle}
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link to={banner.link} className="bg-gold-400 hover:bg-gold-300 text-navy-900 font-bold px-8 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg">
                {banner.cta} <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link to="/shop" className="border-2 border-white/40 hover:border-white text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 backdrop-blur-sm">
                Browse All
              </Link>
            </div>
          </div>
        </div>
        {/* Banner dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {BANNERS.map((_, i) => (
            <button key={i} onClick={() => setHeroBanner(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === heroBanner ? 'bg-gold-400 w-6' : 'bg-white/40'}`} />
          ))}
        </div>
      </section>

      {/* Perks bar */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-navy-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-navy-700" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-navy-800">{title}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-navy-800">Shop by Category</h2>
          <Link to="/shop" className="text-sm text-navy-600 hover:text-navy-800 font-medium flex items-center gap-1">
            All Categories <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {categories.map((cat) => {
            const imgUrl = cat.image?.url || cat.image;
            return (
              <Link
                key={cat._id}
                to={`/shop?category=${cat.slug}`}
                className="group flex flex-col items-center gap-2 text-center"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-200 bg-gray-100">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div className={`w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 items-center justify-center ${imgUrl ? 'hidden' : 'flex'}`}>
                    <FolderIcon className="w-7 h-7 text-white" />
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-700 group-hover:text-navy-700 leading-tight">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-navy-800">Featured Products</h2>
            <p className="text-sm text-gray-500 mt-1">Hand-picked selections just for you</p>
          </div>
          <Link to="/shop?filter=featured" className="text-sm text-navy-600 hover:text-navy-800 font-medium flex items-center gap-1">
            View All <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
        <ProductGrid products={featured} loading={loading.featured} cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" />
      </section>

      {/* Promo banner */}
      <section className="container mx-auto px-4 py-4">
        <div className="bg-gradient-to-r from-purple-700 to-navy-800 rounded-2xl p-6 md:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-1.5 text-gold-400 font-semibold text-sm mb-2">
              <DevicePhoneMobileIcon className="w-4 h-4" />
              Mobile Money Made Easy
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">Pay with MTN or Orange Money</h3>
            <p className="text-white/70">Instant, secure payments. No card needed. Just your phone.</p>
          </div>
          <Link to="/shop" className="btn-gold flex-shrink-0 px-8 py-3 font-bold text-sm">
            Shop Now
          </Link>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-navy-800 flex items-center gap-2">
              <SparklesIcon className="w-6 h-6 text-gold-400" />
              New Arrivals
            </h2>
            <p className="text-sm text-gray-500 mt-1">Fresh products, just added</p>
          </div>
          <Link to="/shop?filter=new-arrivals" className="text-sm text-navy-600 hover:text-navy-800 font-medium flex items-center gap-1">
            View All <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
        <ProductGrid products={newArrivals} loading={loading.newArrivals} cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" />
      </section>

      {/* Best Sellers */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-navy-800 flex items-center gap-2">
                <TrophyIcon className="w-6 h-6 text-gold-400" />
                Best Sellers
              </h2>
              <p className="text-sm text-gray-500 mt-1">Loved by thousands of customers</p>
            </div>
            <Link to="/shop?filter=best-sellers" className="text-sm text-navy-600 hover:text-navy-800 font-medium flex items-center gap-1">
              View All <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <ProductGrid products={bestSellers} loading={loading.bestSellers} cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" />
        </div>
      </section>

      {/* Customer Reviews */}
      <ReviewsSection />

      {/* Brand story / CTA */}
      <section className="bg-navy-900 text-white py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <span className="text-gold-400 font-semibold text-sm tracking-widest uppercase">Our Story</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-3 mb-4">Built for Cameroon, Made with Love</h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            CHANCELOR STORE is on a mission to make quality products accessible to every Cameroonian.
            From Douala to Yaoundé, Bafoussam to Bamenda we deliver to you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/about" className="btn-gold px-8 py-3 font-bold">Our Story</Link>
            <a href="https://whatsapp.com/channel/0029VbAZCCi77qVYUmoUd51a" target="_blank" rel="noopener noreferrer"
              className="border border-white/30 hover:border-white text-white px-8 py-3 rounded-xl font-semibold transition-colors">
              Follow on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
