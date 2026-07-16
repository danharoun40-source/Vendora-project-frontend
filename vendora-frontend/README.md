# Vendora Frontend (Angular 18)

A complete Angular 18 frontend for the Vendora handmade marketplace backend, built with standalone components, real HTTP services (no mock/signal data), Tailwind CSS, JWT auth, and role-based routing (customer / seller / admin).

## Getting Started

```bash
npm install
ng serve
```

The app runs at `http://localhost:4200` and expects the backend API at `http://localhost:5000` (see `src/environments/environment.ts`). Update `apiUrl` there (and in `environment.prod.ts`) if your backend runs elsewhere.

Make sure your backend has `app.use(cors())` enabled and is running before you log in or browse products.

## Project Structure

```
src/app/
  core/
    models/         → TypeScript interfaces matching backend schemas
    services/        → HttpClient services, one per resource (auth, product, cart, order, ...)
    guards/           → authGuard, guestGuard, roleGuard
    interceptors/    → JWT attach + global error/toast handling
    layout/
      customer-layout/    → header, search, cart, account menu, footer (public storefront)
      dashboard-layout/   → sidebar layout shared by seller & admin areas
  shared/components/    → toast, star-rating, empty-state, loading-spinner, confirm-dialog
  features/
    auth/            → login, register
    shop/            → home (browse/search/filter), product-detail, cart, checkout
    account/         → my-orders, order-detail, addresses, wishlist, profile
    seller/          → my-products, product-form (create/edit)
    admin/           → admin-dashboard, manage-products, manage-categories, manage-orders
```

## Routes

| Path | Access | Description |
|---|---|---|
| `/auth/login`, `/auth/register` | Guests only | Auth screens |
| `/shop` | Public | Storefront home (search, categories, product grid) |
| `/shop/products/:id` | Public | Product detail + reviews |
| `/shop/cart`, `/shop/checkout` | Logged in | Cart & checkout (COD) |
| `/shop/orders`, `/shop/orders/:id` | Logged in | Order history & detail |
| `/shop/wishlist`, `/shop/addresses`, `/shop/profile` | Logged in | Account pages |
| `/seller/products`, `/seller/products/new`, `/seller/products/:id/edit` | seller, admin | Manage product listings |
| `/admin/dashboard` | admin | Stats overview |
| `/admin/products`, `/admin/categories`, `/admin/orders` | admin | Full marketplace management |

## Notes on Backend Coverage

This frontend was built directly against your provided backend code. A few things worth knowing:

- **No per-seller store model**: the `Product` schema has no `seller`/`store` reference, and there's no store/branding model at all. So there isn't a real "my own storefront" page per seller — the seller dashboard manages the **shared product catalog** instead. If you want true per-seller storefronts (like the mockup's "vendora.com/danhandmade" flow), the backend needs a `Store` model and a `seller` field on `Product`, plus routes to fetch products by seller/store slug. Happy to build that next if you'd like.
- **`/users` routes aren't mounted** in `index.js` (the file exists but isn't `app.use()`'d), so there's no profile-update or admin user-management endpoint. The Profile page is read-only for now.
- **Product image upload** only works on `POST /products` (create). The `PUT /products/:id` route has no Multer middleware, so editing an existing product's image isn't possible via the current API — the edit form disables image upload and shows a note.
- **Product delete** requires `admin` role in the backend; sellers can create/edit products but the delete button is hidden for the `seller` role (shown for `admin`).
- **Orders don't store a shipping address** — the `Order` schema has no address field, so the order detail page shows items, payment method and totals, not a saved shipping address.

None of these are bugs in the frontend — they're just the current shape of the backend. Let me know if you'd like me to extend the backend to close any of these gaps.
