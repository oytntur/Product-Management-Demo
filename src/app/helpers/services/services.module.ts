import { NgModule } from '@angular/core';
import { ProductService } from './product.service';
import { AuthService } from './auth.service';

@NgModule({
  providers: [ProductService, AuthService],
})
export class ServicesModule {}
