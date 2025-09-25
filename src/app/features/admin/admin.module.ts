import { NgModule } from '@angular/core';

import { SharedUiModule } from '../../shared/shared-ui.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminLayoutComponent } from '../../helpers/layout/admin-layout/admin-layout.component';
import { ProductListComponent } from '../../pages/admin/product-list/product-list.component';
import { ProductComponent } from '../../pages/admin/product/product.component';
import { HomeComponent } from '../../pages/admin/home/home.component';
import { ProductEditComponent } from '../../pages/admin/product-edit/product-edit.component';

@NgModule({
  imports: [
    SharedUiModule,
    AdminRoutingModule,
    AdminLayoutComponent,
    HomeComponent,
    ProductListComponent,
    ProductComponent,
    ProductEditComponent,
  ],
})
export class AdminModule {}
