# CHANCELOR STORE — Project Structure

```
chancelor-store/
├── frontend/                          # React.js PWA
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json              # PWA manifest
│   │   ├── sw.js                      # Service Worker
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   ├── StarRating.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Pagination.jsx
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   └── SEOHead.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── AdminLayout.jsx
│   │   │   ├── home/
│   │   │   │   ├── HeroSlider.jsx
│   │   │   │   ├── CategoryShowcase.jsx
│   │   │   │   ├── FlashSale.jsx
│   │   │   │   ├── FeaturedProducts.jsx
│   │   │   │   ├── BestSellers.jsx
│   │   │   │   ├── NewArrivals.jsx
│   │   │   │   ├── PromoBanners.jsx
│   │   │   │   ├── Testimonials.jsx
│   │   │   │   └── Newsletter.jsx
│   │   │   ├── shop/
│   │   │   │   ├── ProductGrid.jsx
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   ├── FilterPanel.jsx
│   │   │   │   ├── SortDropdown.jsx
│   │   │   │   └── ActiveFilters.jsx
│   │   │   ├── product/
│   │   │   │   ├── ImageGallery.jsx
│   │   │   │   ├── VariantSelector.jsx
│   │   │   │   ├── ReviewSection.jsx
│   │   │   │   ├── ReviewForm.jsx
│   │   │   │   ├── RelatedProducts.jsx
│   │   │   │   ├── FrequentlyBought.jsx
│   │   │   │   └── ProductTabs.jsx
│   │   │   ├── cart/
│   │   │   │   ├── CartItem.jsx
│   │   │   │   ├── CartSummary.jsx
│   │   │   │   └── CouponInput.jsx
│   │   │   ├── checkout/
│   │   │   │   ├── ShippingForm.jsx
│   │   │   │   ├── PaymentSelector.jsx
│   │   │   │   ├── OrderSummary.jsx
│   │   │   │   └── OrderConfirmation.jsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   └── PasswordReset.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── ProfileSection.jsx
│   │   │   │   ├── OrderHistory.jsx
│   │   │   │   ├── WishlistTab.jsx
│   │   │   │   ├── AddressBook.jsx
│   │   │   │   └── OrderTracker.jsx
│   │   │   └── admin/
│   │   │       ├── Sidebar.jsx
│   │   │       ├── StatsCards.jsx
│   │   │       ├── RevenueChart.jsx
│   │   │       ├── ProductForm.jsx
│   │   │       ├── ImageUploader.jsx
│   │   │       ├── VariantManager.jsx
│   │   │       ├── OrderTable.jsx
│   │   │       ├── CustomerTable.jsx
│   │   │       ├── CouponManager.jsx
│   │   │       └── InventoryAlerts.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Shop.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Category.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── OrderSuccess.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Wishlist.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Blog.jsx
│   │   │   ├── BlogPost.jsx
│   │   │   ├── FAQ.jsx
│   │   │   ├── HelpCenter.jsx
│   │   │   ├── Privacy.jsx
│   │   │   ├── Terms.jsx
│   │   │   ├── ShippingPolicy.jsx
│   │   │   ├── ReturnPolicy.jsx
│   │   │   ├── Careers.jsx
│   │   │   ├── NotFound.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── Products.jsx
│   │   │       ├── AddProduct.jsx
│   │   │       ├── EditProduct.jsx
│   │   │       ├── Orders.jsx
│   │   │       ├── Customers.jsx
│   │   │       ├── Categories.jsx
│   │   │       ├── Inventory.jsx
│   │   │       ├── Analytics.jsx
│   │   │       ├── Coupons.jsx
│   │   │       ├── Marketing.jsx
│   │   │       ├── Content.jsx
│   │   │       ├── Settings.jsx
│   │   │       └── AuditLogs.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useCart.js
│   │   │   ├── useWishlist.js
│   │   │   ├── useSearch.js
│   │   │   ├── useInfiniteScroll.js
│   │   │   ├── useDebounce.js
│   │   │   ├── useLocalStorage.js
│   │   │   └── useNotifications.js
│   │   ├── redux/
│   │   │   ├── store.js
│   │   │   └── slices/
│   │   │       ├── authSlice.js
│   │   │       ├── cartSlice.js
│   │   │       ├── wishlistSlice.js
│   │   │       ├── productSlice.js
│   │   │       ├── orderSlice.js
│   │   │       ├── uiSlice.js
│   │   │       └── notificationSlice.js
│   │   ├── services/
│   │   │   ├── api.js                 # Axios base config
│   │   │   ├── authService.js
│   │   │   ├── productService.js
│   │   │   ├── orderService.js
│   │   │   ├── cartService.js
│   │   │   ├── userService.js
│   │   │   ├── reviewService.js
│   │   │   ├── couponService.js
│   │   │   ├── uploadService.js
│   │   │   └── paymentService.js
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── styles/
│   │   │   ├── index.css              # Tailwind + custom vars
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── routes.jsx
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── index.html
│
├── backend/                           # Node.js + Express
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                  # MongoDB connection
│   │   │   ├── cloudinary.js
│   │   │   ├── stripe.js
│   │   │   └── mailer.js
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
│   │   │   ├── userController.js
│   │   │   ├── productController.js
│   │   │   ├── categoryController.js
│   │   │   ├── orderController.js
│   │   │   ├── cartController.js
│   │   │   ├── wishlistController.js
│   │   │   ├── reviewController.js
│   │   │   ├── couponController.js
│   │   │   ├── paymentController.js
│   │   │   ├── uploadController.js
│   │   │   ├── notificationController.js
│   │   │   ├── blogController.js
│   │   │   ├── supportController.js
│   │   │   └── analyticsController.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── category.routes.js
│   │   │   ├── order.routes.js
│   │   │   ├── cart.routes.js
│   │   │   ├── wishlist.routes.js
│   │   │   ├── review.routes.js
│   │   │   ├── coupon.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── upload.routes.js
│   │   │   ├── notification.routes.js
│   │   │   ├── blog.routes.js
│   │   │   ├── support.routes.js
│   │   │   └── analytics.routes.js
│   │   ├── middleware/
│   │   │   ├── auth.js                # JWT verify + RBAC
│   │   │   ├── errorHandler.js
│   │   │   ├── rateLimiter.js
│   │   │   ├── validator.js
│   │   │   ├── fileUpload.js
│   │   │   ├── auditLogger.js
│   │   │   └── cors.js
│   │   └── utils/
│   │       ├── jwt.js
│   │       ├── email.js
│   │       ├── sms.js
│   │       ├── imageProcessor.js
│   │       ├── currency.js
│   │       └── seedData.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── nginx/
│   ├── nginx.conf
│   └── ssl/
│
├── docker/
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
│
├── docs/
│   ├── API.md                         # Full REST API reference
│   ├── INSTALL.md
│   └── DEPLOY.md
│
└── README.md
```
