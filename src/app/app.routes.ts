import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'shop', pathMatch: 'full' },

  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  {
    path: 'shop',
    loadComponent: () =>
      import('./core/layout/customer-layout/customer-layout.component').then(
        (m) => m.CustomerLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/shop/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('./features/shop/product-detail/product-detail.component').then(
            (m) => m.ProductDetailComponent
          ),
      },
      {
        path: 'cart',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/shop/cart/cart.component').then((m) => m.CartComponent),
      },
      {
        path: 'checkout',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/shop/checkout/checkout.component').then(
            (m) => m.CheckoutComponent
          ),
      },
      {
        path: 'orders',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/account/my-orders/my-orders.component').then(
            (m) => m.MyOrdersComponent
          ),
      },
      {
        path: 'orders/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/account/order-detail/order-detail.component').then(
            (m) => m.OrderDetailComponent
          ),
      },
      {
        path: 'wishlist',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/account/wishlist/wishlist.component').then(
            (m) => m.WishlistComponent
          ),
      },
      {
        path: 'addresses',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/account/addresses/addresses.component').then(
            (m) => m.AddressesComponent
          ),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/account/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
    ],
  },

  {
    path: 'seller',
    canActivate: [roleGuard(['seller', 'admin'])],
    loadComponent: () =>
      import('./core/layout/dashboard-layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent
      ),
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/seller/my-products/my-products.component').then(
            (m) => m.MyProductsComponent
          ),
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./features/seller/product-form/product-form.component').then(
            (m) => m.ProductFormComponent
          ),
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./features/seller/product-form/product-form.component').then(
            (m) => m.ProductFormComponent
          ),
      },
    ],
  },

  {
    path: 'admin',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () =>
      import('./core/layout/dashboard-layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent
      ),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin/manage-products/manage-products.component').then(
            (m) => m.ManageProductsComponent
          ),
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./features/seller/product-form/product-form.component').then(
            (m) => m.ProductFormComponent
          ),
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./features/seller/product-form/product-form.component').then(
            (m) => m.ProductFormComponent
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/manage-categories/manage-categories.component').then(
            (m) => m.ManageCategoriesComponent
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/admin/manage-orders/manage-orders.component').then(
            (m) => m.ManageOrdersComponent
          ),
      },
    ],
  },

  { path: '**', redirectTo: 'shop' },
];
