import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminLayoutComponent } from '../../helpers/layout/admin-layout/admin-layout.component';
import { HomeComponent } from '../../pages/admin/home/home.component';
import { ProductListComponent } from '../../pages/admin/product-list/product-list.component';
import { ProductEditComponent } from '../../pages/admin/product-edit/product-edit.component';
import { ProductComponent } from '../../pages/admin/product/product.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'home',
        title: 'Ana Sayfa',
        component: HomeComponent,
      },
      {
        path: 'products',
        children: [
          {
            path: '',
            title: 'Ürünler',
            component: ProductListComponent,
          },
          {
            path: 'new',
            title: 'Ürün Ekle',
            component: ProductEditComponent,
          },
          {
            path: ':productId/edit',
            title: 'Ürünü Düzenle',
            component: ProductEditComponent,
          },
          {
            path: ':productId',
            component: ProductComponent,
            data: { customTitle: true },
          },
        ],
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
