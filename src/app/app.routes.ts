import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/auth/register/register.component').then((m) => m.RegisterComponent),
      },
    ],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./helpers/layout/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent
      ),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/admin/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/admin/product-list/product-list.component').then(
            (m) => m.ProductListComponent
          ),
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('./pages/admin/product/product.component').then((m) => m.ProductComponent),
      },
      {
        path: 'products/:productId/edit',
        loadComponent: () =>
          import('./pages/admin/product-add/product-edit.component').then(
            (m) => m.ProductEditComponent
          ),
      },
    ],
  },
];
