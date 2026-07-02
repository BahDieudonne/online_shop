import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ShoppingCartIcon,
  HeartIcon,
  UserIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { ShoppingCartIcon as CartSolid } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { toggleCart, setMobileMenuOpen, toggleMobileMenu } from '../../redux/slices/uiSlice';
import { logout } from '../../redux/slices/authSlice';
import { selectCartCount } from '../../redux/slices/cartSlice';
import { selectWishlistCount } from '../../redux/slices/wishlistSlice';
import { useDebounce } from '../../hooks/useDebounce';
import productService from '../../services/productService';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const { mobileMenuOpen } = useSelector((s) => s.ui);
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector(selectWishlistCount);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // NAV_LINKS defined inside component so it reacts to language changes
  const NAV_LINKS = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.shop'), path: '/shop' },
    { label: t('nav.blog'), path: '/blog' },
    { label: t('nav.about'), path: '/about' },
    { label: t('nav.contact'), path: '/contact' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      productService.getProducts({ search: debouncedSearch, limit: 6 }).then((res) => {
        setSuggestions(res?.products || []);
        setShowSuggestions(true);
      }).catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    dispatch(setMobileMenuOpen(false));
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    navigate('/');
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
  };

  return (
    <>
      {/* Top bar */}
      <div className="bg-navy-900 text-white text-xs py-1.5 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <span>🇨🇲 Livraison partout au Cameroun | {t('nav.freeDelivery')}</span>
          <div className="flex gap-4">
            <Link to="/track-order" className="hover:text-gold-400 transition-colors">{t('nav.trackOrder')}</Link>
            <Link to="/help" className="hover:text-gold-400 transition-colors">{t('nav.helpCenter')}</Link>
            <span>📞 +237 674 962 803</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-lg' : ''} bg-white`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-navy-700 to-purple-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div className="hidden sm:block">
                <div className="font-display font-bold text-navy-800 leading-tight text-lg">CHANCELOR</div>
                <div className="text-[10px] text-gold-500 font-semibold tracking-widest -mt-1">STORE</div>
              </div>
            </Link>

            {/* Search bar */}
            <div className="flex-1 max-w-2xl relative" ref={searchRef}>
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder={t('common.searchPlaceholder')}
                  className="w-full border-2 border-navy-200 rounded-l-lg px-4 py-2 text-sm focus:outline-none focus:border-navy-500 transition-colors"
                />
                <button
                  type="submit"
                  className="bg-navy-700 hover:bg-navy-800 text-white px-4 rounded-r-lg transition-colors flex items-center"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              </form>

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-xl z-50 overflow-hidden">
                  {suggestions.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => { navigate(`/product/${p.slug}`); setShowSuggestions(false); setSearchQuery(''); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors"
                    >
                      <img src={p.images?.[0]?.thumbnail || p.images?.[0]?.url} alt={p.name} className="w-10 h-10 object-cover rounded" />
                      <div>
                        <div className="text-sm font-medium text-gray-800 line-clamp-1">{p.name}</div>
                        <div className="text-xs text-gold-600 font-semibold">{p.discountPrice?.toLocaleString('fr-CM')} FCFA</div>
                      </div>
                    </button>
                  ))}
                  <Link
                    to={`/search?q=${encodeURIComponent(searchQuery)}`}
                    onClick={() => setShowSuggestions(false)}
                    className="block text-center text-xs text-navy-600 hover:text-navy-800 py-2 border-t"
                  >
                    See all results for "{searchQuery}"
                  </Link>
                </div>
              )}
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Language toggle */}
              <button
                onClick={toggleLanguage}
                className="hidden md:flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-navy-700 px-2 py-1 rounded border border-gray-200 hover:border-navy-300 transition-all"
                title="Switch language"
              >
                {i18n.language === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
              </button>

              {/* Wishlist */}
              <Link to="/account/wishlist" className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors">
                <HeartIcon className="w-6 h-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-purple-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={() => dispatch(toggleCart())}
                className="relative p-2 text-gray-600 hover:text-navy-700 transition-colors"
              >
                <CartSolid className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gold-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {/* User menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 p-2 text-gray-600 hover:text-navy-700 transition-colors"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.firstName} className="w-7 h-7 rounded-full object-cover border-2 border-navy-200" />
                  ) : (
                    <UserIcon className="w-6 h-6" />
                  )}
                  <ChevronDownIcon className="w-3 h-3 hidden md:block" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-3 bg-gradient-to-r from-navy-50 to-purple-50 border-b">
                          <p className="font-semibold text-navy-800 text-sm">{user?.firstName} {user?.lastName}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <nav className="py-1">
                          <Link to="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>{t('nav.myAccount')}</Link>
                          <Link to="/account/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>{t('nav.myOrders')}</Link>
                          <Link to="/account/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>{t('nav.wishlist')}</Link>
                          {(user?.role === 'admin' || user?.role === 'super_admin') && (
                            <Link to="/admin" className="block px-4 py-2 text-sm text-purple-700 font-medium hover:bg-purple-50" onClick={() => setUserMenuOpen(false)}>{t('nav.adminPanel')}</Link>
                          )}
                          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t">{t('nav.signOut')}</button>
                        </nav>
                      </>
                    ) : (
                      <div className="p-3 space-y-2">
                        <Link to="/login" className="btn-primary w-full text-center text-sm block" onClick={() => setUserMenuOpen(false)}>{t('nav.signIn')}</Link>
                        <Link to="/register" className="btn-secondary w-full text-center text-sm block" onClick={() => setUserMenuOpen(false)}>{t('nav.createAccount')}</Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => dispatch(toggleMobileMenu())}
                className="p-2 text-gray-600 hover:text-navy-700 md:hidden"
              >
                {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Nav links — desktop */}
          <nav className="hidden md:flex items-center gap-6 py-2 border-t border-gray-100">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-navy-700 flex items-center gap-1 ${
                  location.pathname === link.path ? 'text-navy-700 font-semibold' : 'text-gray-600'
                }`}
              >
                {link.label}
                {link.hasDropdown && <ChevronDownIcon className="w-3 h-3" />}
              </Link>
            ))}
            <div className="ml-auto">
              <Link to="/shop?filter=flash-sale" className="flex items-center gap-1 text-sm font-semibold text-red-600 animate-pulse">
                🔥 {t('nav.flashSale')}
              </Link>
            </div>
          </nav>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 shadow-lg">
            <nav className="space-y-1 pt-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block py-2.5 text-sm font-medium border-b border-gray-50 ${
                    location.pathname === link.path ? 'text-navy-700' : 'text-gray-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link to="/shop?filter=flash-sale" className="block py-2.5 text-sm font-semibold text-red-600">🔥 {t('nav.flashSale')}</Link>
              {/* Language toggle in mobile menu */}
              <button
                onClick={toggleLanguage}
                className="block w-full text-left py-2.5 text-sm font-medium text-gray-700 border-b border-gray-50"
              >
                {i18n.language === 'fr' ? '🇬🇧 Switch to English' : '🇫🇷 Passer en Français'}
              </button>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
