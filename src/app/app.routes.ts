import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        title: 'Login',
        loadComponent: () =>
          import('./pages/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        title: 'Register',
        loadComponent: () =>
          import('./pages/auth/register/register.component').then((m) => m.RegisterComponent),
      },
    ],
  },
  {
    path: 'admin',
    title: 'Admin',
    loadComponent: () =>
      import('./helpers/layout/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent
      ),
    children: [
      {
        path: 'home',
        title: 'Home',
        loadComponent: () =>
          import('./pages/admin/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'products',
        title: 'Products',
        loadComponent: () =>
          import('./pages/admin/product-list/product-list.component').then(
            (m) => m.ProductListComponent
          ),
      },
      {
        path: 'products/:productId',
        title: 'Product Details',
        loadComponent: () =>
          import('./pages/admin/product/product.component').then((m) => m.ProductComponent),
      },
      {
        path: 'products/:productId/edit',
        title: 'Edit Product',
        loadComponent: () =>
          import('./pages/admin/product-add/product-edit.component').then(
            (m) => m.ProductEditComponent
          ),
      },
    ],
  },
];
