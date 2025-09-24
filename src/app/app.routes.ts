import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        title: 'Giriş Yap',
        loadComponent: () =>
          import('./pages/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        title: 'Kayıt Ol',
        loadComponent: () =>
          import('./pages/auth/register/register.component').then((m) => m.RegisterComponent),
      },
    ],
  },
  {
    path: 'admin',
    title: 'Yönetim',
    loadComponent: () =>
      import('./helpers/layout/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent
      ),
    children: [
      {
        path: 'home',
        title: 'Ana Sayfa',
        loadComponent: () =>
          import('./pages/admin/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'products',
        children: [
          {
            path: '',
            title: 'Ürünler',
            loadComponent: () =>
              import('./pages/admin/product-list/product-list.component').then(
                (m) => m.ProductListComponent
              ),
          },
          {
            path: 'new',
            title: 'Ürün Ekle',
            loadComponent: () =>
              import('./pages/admin/product-edit/product-edit.component').then(
                (m) => m.ProductEditComponent
              ),
          },
          {
            path: ':productId/edit',
            title: 'Ürünü Düzenle',
            loadComponent: () =>
              import('./pages/admin/product-edit/product-edit.component').then(
                (m) => m.ProductEditComponent
              ),
          },
          {
            path: ':productId',
            title: 'Ürün Detayı',
            loadComponent: () =>
              import('./pages/admin/product/product.component').then((m) => m.ProductComponent),
          },
        ],
      },
    ],
  },
];
