import { NgModule } from '@angular/core';

import { SharedUiModule } from '../../shared/shared-ui.module';
import { AuthRoutingModule } from './auth-routing.module';
import { RegisterComponent } from '../../pages/auth/register/register.component';
import { LoginComponent } from '../../pages/auth/login/login.component';

@NgModule({
  imports: [SharedUiModule, AuthRoutingModule, LoginComponent, RegisterComponent],
})
export class AuthModule {}
