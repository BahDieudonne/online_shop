# CHANCELOR STORE Complete Project Structure

```
chancelor-store/
├── frontend/                          # React.js PWA
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json              # PWA manifest
│   │   └── sw.js                      # Service Worker
│   ├── src/
│   │   ├── assets/                    # Static assets
│   │   ├── components/
│   │   │   ├── common/               # Shared UI primitives
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Alert.jsx
│   │   │   │   ├── Pagination.jsx
│   │   │   │   ├── StarRating.jsx
│   │   │   │   └── ImageGallery.jsx
│   │   │   ├── layout/               # App chrome
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── AdminLayout.jsx
│   │   │   │   └── CustomerLayout.jsx
│   │   │   ├── product/              # Product display
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   ├── ProductGrid.jsx
│   │   │   │   ├── ProductFilters.jsx
│   │   │   │   ├── ProductVariants.jsx
│   │   │   │   ├── ProductReviews.jsx
│   │   │   │   └── ProductSearch.jsx
│   │   │   ├── cart/
│   │   │   │   ├── CartDrawer.jsx
│   │   │   │   └── CartItem.jsx
│   │   │   ├── checkout/
│   │   │   │   ├── ShippingForm.jsx
│   │   │   │   ├── PaymentSelector.jsx
│   │   │   │   └── OrderSummary.jsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminSidebar.jsx
│   │   │   │   ├── ProductForm.jsx
│   │   │   │   ├── ImageUploader.jsx
│   │   │   │   ├── RichTextEditor.jsx
│   │   │   │   ├── DataTable.jsx
│   │   │   │   ├── StatCard.jsx
│   │   │   │   └── Charts.jsx
│   │   │   └── customer/
│   │   │       ├── OrderTimeline.jsx
│   │   │       └── WishlistCard.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ShopPage.jsx
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── CategoryPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── OrderConfirmationPage.jsx
│   │   │   ├── SearchPage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   ├── ContactPage.jsx
│   │   │   ├── BlogPage.jsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── RegisterPage.jsx
│   │   │   │   └── ForgotPasswordPage.jsx
│   │   │   ├── customer/
│   │   │   │   ├── DashboardPage.jsx
│   │   │   │   ├── OrdersPage.jsx
│   │   │   │   ├── OrderDetailPage.jsx
│   │   │   │   ├── WishlistPage.jsx
│   │   │   │   ├── ProfilePage.jsx
│   │   │   │   └── AddressesPage.jsx
│   │   │   └── admin/
│   │   │       ├── DashboardPage.jsx
│   │   │       ├── ProductsPage.jsx
│   │   │       ├── ProductFormPage.jsx
│   │   │       ├── OrdersPage.jsx
│   │   │       ├── OrderDetailPage.jsx
│   │   │       ├── CustomersPage.jsx
│   │   │       ├── InventoryPage.jsx
│   │   │       ├── CouponsPage.jsx
│   │   │       ├── AnalyticsPage.jsx
│   │   │       ├── ContentPage.jsx
│   │   │       └── SettingsPage.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useCart.js
│   │   │   ├── useWishlist.js
│   │   │   ├── useDebounce.js
│   │   │   └── useLocalStorage.js
│   │   ├── store/
│   │   │   ├── index.js              # Redux store
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       ├── cartSlice.js
│   │   │       ├── wishlistSlice.js
│   │   │       ├── productSlice.js
│   │   │       └── uiSlice.js
│   │   ├── services/
│   │   │   ├── api.js                # Axios instance
│   │   │   ├── authService.js
│   │   │   ├── productService.js
│   │   │   ├── orderService.js
│   │   │   ├── cartService.js
│   │   │   ├── paymentService.js
│   │   │   └── uploadService.js
│   │   ├── utils/
│   │   │   ├── formatters.js         # Currency, date, etc.
│   │   │   ├── validators.js
│   │   │   └── constants.js
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.example
│
├── backend/                           # Node.js / Express API
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Category.js
│   │   │   ├── Order.js
│   │   │   ├── Payment.js
│   │   │   ├── Review.js
│   │   │   ├── Wishlist.js
│   │   │   ├── Cart.js
│   │   │   ├── Coupon.js
│   │   │   ├── Notification.js
│   │   │   ├── BlogPost.js
│   │   │   ├── SupportTicket.js
│   │   │   └── AuditLog.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── categoryController.js
│   │   │   ├── orderController.js
│   │   │   ├── paymentController.js
│   │   │   ├── reviewController.js
│   │   │   ├── cartController.js
│   │   │   ├── wishlistController.js
│   │   │   ├── couponController.js
│   │   │   ├── userController.js
│   │   │   ├── uploadController.js
│   │   │   ├── analyticsController.js
│   │   │   └── notificationController.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── products.js
│   │   │   ├── categories.js
│   │   │   ├── orders.js
│   │   │   ├── payments.js
│   │   │   ├── reviews.js
│   │   │   ├── cart.js
│   │   │   ├── wishlist.js
│   │   │   ├── coupons.js
│   │   │   ├── users.js
│   │   │   ├── upload.js
│   │   │   ├── analytics.js
│   │   │   └── notifications.js
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT verification
│   │   │   ├── rbac.js               # Role-based access
│   │   │   ├── upload.js             # Multer config
│   │   │   ├── rateLimiter.js
│   │   │   ├── errorHandler.js
│   │   │   ├── validate.js
│   │   │   └── auditLogger.js
│   │   ├── services/
│   │   │   ├── emailService.js       # Nodemailer
│   │   │   ├── smsService.js
│   │   │   ├── pushService.js
│   │   │   ├── storageService.js     # Local/Cloudinary/S3/GCS
│   │   │   ├── stripeService.js
│   │   │   ├── paypalService.js
│   │   │   └── mobileMoneyService.js # MTN + Orange Money
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── cloudinary.js
│   │   │   ├── aws.js
│   │   │   └── redis.js
│   │   └── utils/
│   │       ├── apiResponse.js
│   │       ├── imageProcessor.js
│   │       └── seedData.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── nginx/
│   ├── nginx.conf
│   └── ssl/
├── docs/
│   ├── FOLDER_STRUCTURE.md
│   ├── API_REFERENCE.md
│   ├── SETUP_GUIDE.md
│   └── DEPLOYMENT_GUIDE.md
├── scripts/
│   └── seed.js
├── docker-compose.yml
├── Dockerfile.frontend
├── Dockerfile.backend
└── README.md
```
