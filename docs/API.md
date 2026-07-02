# CHANCELOR STORE REST API Documentation

Base URL: `https://api.chancelorstore.cm/api`

## Authentication

All protected routes require: `Authorization: Bearer <accessToken>`

Access tokens expire in **15 minutes**. Use the refresh endpoint to get new ones.

---

## Auth Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Create account | No |
| POST | `/auth/login` | Login, get tokens | No |
| POST | `/auth/refresh` | Refresh access token (cookie) | No |
| POST | `/auth/logout` | Revoke refresh token | Yes |
| POST | `/auth/forgot-password` | Send reset email | No |
| PATCH | `/auth/reset-password/:token` | Reset password | No |

### POST /auth/register
```json
{
  "firstName": "Jean",
  "lastName": "Mballa",
  "email": "jean@example.com",
  "password": "SecurePass123!",
  "phone": "+237674962803",
  "referralCode": "CHN-ABC12345"
}
```

---

## Product Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/products` | List products (filtered/paginated) | Optional |
| GET | `/products/:id` | Get product by ID or slug | Optional |
| GET | `/products/search/autocomplete?q=` | Autocomplete suggestions | No |
| POST | `/products` | Create product | Admin |
| PUT | `/products/:id` | Update product | Admin |
| DELETE | `/products/:id` | Soft-delete product | Admin |
| PATCH | `/products/:id/restore` | Restore deleted product | Admin |
| POST | `/products/bulk-import` | Bulk import from CSV/Excel | Admin |

### GET /products Query Parameters
| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |
| sort | string | Sort field: `-createdAt`, `price`, `-price`, `-analytics.purchaseCount` |
| category | ObjectId | Filter by category |
| subcategory | ObjectId | Filter by subcategory |
| brand | string | Filter by brand (regex) |
| minPrice | number | Min price in XAF |
| maxPrice | number | Max price in XAF |
| inStock | boolean | Only in-stock items |
| search | string | Full-text search |
| isFeatured | boolean | Featured products only |
| isFlashSale | boolean | Flash sale products |
| isBestSeller | boolean | Best sellers |
| isNewArrival | boolean | New arrivals |
| status | string | `published`,`draft`,`archived` (Admin only) |

---

## Order Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/orders` | My orders (customer) or all orders (admin) | Yes |
| GET | `/orders/:id` | Order detail | Yes |
| POST | `/orders` | Place order | Yes |
| PATCH | `/orders/:id/status` | Update order status | Admin |
| PATCH | `/orders/:id/cancel` | Cancel order | Yes |
| POST | `/orders/:id/refund` | Process refund | Admin |
| GET | `/orders/:id/invoice` | Download invoice PDF | Yes |
| GET | `/orders/:id/tracking` | Real-time tracking events | Yes |

### POST /orders Request Body
```json
{
  "items": [
    { "product": "productId", "variantId": "variantId", "quantity": 2 }
  ],
  "shippingAddress": {
    "fullName": "Jean Mballa",
    "phone": "+237674962803",
    "street": "3 Rue Mokoum",
    "city": "Buea",
    "region": "South-West"
  },
  "payment": {
    "method": "mtn_momo",
    "mobileNumber": "+237674962803"
  },
  "couponCode": "SAVE20"
}
```

---

## Cart Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/cart` | Get current cart | Optional |
| POST | `/cart/items` | Add item to cart | Optional |
| PUT | `/cart/items/:itemId` | Update quantity | Optional |
| DELETE | `/cart/items/:itemId` | Remove item | Optional |
| POST | `/cart/coupon` | Apply coupon code | Optional |
| DELETE | `/cart/coupon` | Remove coupon | Optional |
| DELETE | `/cart` | Clear cart | Optional |
| PATCH | `/cart/items/:itemId/save-for-later` | Save item for later | Optional |

---

## Payment Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/payments/stripe/intent` | Create Stripe payment intent | Yes |
| POST | `/payments/paypal/create` | Create PayPal order | Yes |
| POST | `/payments/paypal/capture/:orderId` | Capture PayPal payment | Yes |
| POST | `/payments/mtn/initiate` | Initiate MTN MoMo payment | Yes |
| POST | `/payments/orange/initiate` | Initiate Orange Money payment | Yes |
| POST | `/payments/webhook/stripe` | Stripe webhook | No |
| POST | `/payments/webhook/mtn` | MTN MoMo webhook | No |
| GET | `/payments/:id/status` | Check payment status | Yes |

---

## User / Account Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/me` | Get my profile | Yes |
| PUT | `/users/me` | Update profile | Yes |
| PUT | `/users/me/password` | Change password | Yes |
| POST | `/users/me/addresses` | Add address | Yes |
| PUT | `/users/me/addresses/:id` | Update address | Yes |
| DELETE | `/users/me/addresses/:id` | Delete address | Yes |
| PATCH | `/users/me/addresses/:id/default` | Set default address | Yes |
| PUT | `/users/me/notifications` | Update notification preferences | Yes |
| GET | `/users/me/loyalty` | Get loyalty points/tier | Yes |
| GET | `/users` | List all users | Admin |
| GET | `/users/:id` | User detail | Admin |
| PATCH | `/users/:id/ban` | Ban/unban user | Admin |
| PATCH | `/users/:id/role` | Change user role | Super Admin |

---

## Review Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/reviews?product=:id` | Product reviews | No |
| POST | `/reviews` | Write review (verified purchase) | Yes |
| PUT | `/reviews/:id` | Edit review | Yes |
| DELETE | `/reviews/:id` | Delete review | Yes |
| POST | `/reviews/:id/helpful` | Vote helpful | Yes |
| PATCH | `/reviews/:id/approve` | Approve review | Admin |

---

## Category Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/categories` | All categories (tree) | No |
| GET | `/categories/:slug` | Category + products | No |
| POST | `/categories` | Create category | Admin |
| PUT | `/categories/:id` | Update category | Admin |
| DELETE | `/categories/:id` | Delete category | Admin |

---

## Analytics Endpoints (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/overview` | Revenue, orders, customers summary |
| GET | `/analytics/sales?period=30d` | Sales chart data |
| GET | `/analytics/products/top` | Top-selling products |
| GET | `/analytics/customers/segments` | Customer segmentation |
| GET | `/analytics/inventory` | Stock levels report |
| GET | `/analytics/revenue?groupBy=day|week|month` | Revenue breakdown |

---

## Coupon Endpoints (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/coupons` | List all coupons |
| POST | `/coupons` | Create coupon |
| PUT | `/coupons/:id` | Update coupon |
| DELETE | `/coupons/:id` | Delete coupon |
| POST | `/coupons/validate` | Validate coupon code |

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Unauthenticated (no or invalid token) |
| 403 | Forbidden (insufficient role) |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 422 | Validation failed |
| 429 | Rate limit exceeded |
| 500 | Server error |

---

## Error Response Format
```json
{
  "message": "Human-readable error message",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ],
  "code": "TOKEN_EXPIRED"
}
```

## Pagination Response Format
```json
{
  "products": [...],
  "pagination": {
    "total": 247,
    "page": 2,
    "limit": 20,
    "pages": 13
  }
}
```
