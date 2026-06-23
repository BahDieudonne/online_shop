import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { store } from './redux/store';
import { checkAuth } from './redux/slices/authSlice';

import CustomerLayout from './components/layout/CustomerLayout';
import AdminLayout from './components/layout/AdminLayout';
import { ProtectedRoute, GuestRoute, AdminRoute } from './components/auth/ProtectedRoute';

// Eagerly loaded (critical path)
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Customer pages
const ShopPage           = lazy(() => import('./pages/ShopPage'));
const ProductDetailPage  = lazy(() => import('./pages/ProductDetailPage'));
const CartPage           = lazy(() => import('./pages/CartPage'));
const CheckoutPage       = lazy(() => import('./pages/CheckoutPage'));
const OrderConfirmPage   = lazy(() => import('./pages/OrderConfirmationPage'));
const SearchPage         = lazy(() => import('./pages/SearchPage'));
const TrackOrderPage     = lazy(() => import('./pages/TrackOrderPage'));
const NotFoundPage       = lazy(() => import('./pages/NotFoundPage'));
const UnauthorizedPage   = lazy(() => import('./pages/UnauthorizedPage'));

// Static pages
const AboutPage          = lazy(() => import('./pages/static/AboutPage'));
const ContactPage        = lazy(() => import('./pages/static/ContactPage'));
const FAQPage            = lazy(() => import('./pages/static/FAQPage'));
const BlogPage           = lazy(() => import('./pages/static/BlogPage'));
const ShippingPolicyPage = lazy(() => import('./pages/static/ShippingPolicyPage'));
const ReturnPolicyPage   = lazy(() => import('./pages/static/ReturnPolicyPage'));
const PrivacyPage        = lazy(() => import('./pages/static/PrivacyPage'));
const TermsPage          = lazy(() => import('./pages/static/TermsPage'));

// Account pages
const AccountDashboard   = lazy(() => import('./pages/account/AccountDashboard'));
const AccountProfile     = lazy(() => import('./pages/account/AccountProfile'));
const AccountOrders      = lazy(() => import('./pages/account/AccountOrders'));
const AccountOrderDetail = lazy(() => import('./pages/account/AccountOrderDetail'));
const AccountAddresses   = lazy(() => import('./pages/account/AccountAddresses'));
const AccountWishlist    = lazy(() => import('./pages/account/AccountWishlist'));

// Auth pages
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage  = lazy(() => import('./pages/auth/ResetPasswordPage'));

// Admin pages
const AdminDashboard   = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts    = lazy(() => import('./pages/admin/AdminProducts'));
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm'));
const AdminOrders      = lazy(() => import('./pages/admin/AdminOrders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'));
const AdminCustomers   = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminAnalytics   = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminCoupons     = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminInventory   = lazy(() => import('./pages/admin/AdminInventory'));
const AdminCategories  = lazy(() => import('./pages/admin/AdminCategories'));
const AdminMarketing   = lazy(() => import('./pages/admin/AdminMarketing'));
const AdminContent     = lazy(() => import('./pages/admin/AdminContent'));
const AdminSettings    = lazy(() => import('./pages/admin/AdminSettings'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
  </div>
);

// Runs checkAuth once on mount; blocks rendering until the cookie-based
// session check completes so routes never flash the wrong auth state.
function AuthGate({ children }) {
  const dispatch = useDispatch();
  const { isAuthChecked } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (!isAuthChecked) return <PageLoader />;
  return children;
}

function App() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthGate>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Customer routes (shared layout with Header/Footer) ── */}
              <Route element={<CustomerLayout />}>
                <Route index element={<HomePage />} />
                <Route path="shop" element={<ShopPage />} />
                <Route path="product/:slug" element={<ProductDetailPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="track-order" element={<TrackOrderPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="faq" element={<FAQPage />} />
                <Route path="blog" element={<BlogPage />} />
                <Route path="shipping-policy" element={<ShippingPolicyPage />} />
                <Route path="return-policy" element={<ReturnPolicyPage />} />
                <Route path="privacy-policy" element={<PrivacyPage />} />
                <Route path="terms" element={<TermsPage />} />

                {/* Protected customer routes */}
                <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="order/success/:id" element={<ProtectedRoute><OrderConfirmPage /></ProtectedRoute>} />
                <Route path="account" element={<ProtectedRoute><AccountDashboard /></ProtectedRoute>} />
                <Route path="account/profile" element={<ProtectedRoute><AccountProfile /></ProtectedRoute>} />
                <Route path="account/orders" element={<ProtectedRoute><AccountOrders /></ProtectedRoute>} />
                <Route path="account/orders/:id" element={<ProtectedRoute><AccountOrderDetail /></ProtectedRoute>} />
                <Route path="account/addresses" element={<ProtectedRoute><AccountAddresses /></ProtectedRoute>} />
                <Route path="account/wishlist" element={<ProtectedRoute><AccountWishlist /></ProtectedRoute>} />

                <Route path="unauthorized" element={<UnauthorizedPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* ── Auth routes (no layout) ── */}
              <Route path="login" element={<GuestRoute><LoginPage /></GuestRoute>} />
              <Route path="register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password/:token" element={<ResetPasswordPage />} />

              {/* ── Admin routes (AdminLayout + role guard) ── */}
              <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/new" element={<AdminProductForm />} />
                <Route path="products/:id/edit" element={<AdminProductForm />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/:id" element={<AdminOrderDetail />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="marketing" element={<AdminMarketing />} />
                <Route path="content" element={<AdminContent />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Routes>
          </Suspense>
          </AuthGate>
        </Router>
      </HelmetProvider>
    </Provider>
  );
}

export default App;
