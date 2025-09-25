import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { NavbarComponent } from '../components/navbar/navbar.component';
import { FooterComponent } from '../components/footer/footer.component';
import { LoadingCardComponent } from '../components/loading-card/loading-card.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NavbarComponent,
    FooterComponent,
    LoadingCardComponent,
  ],
  exports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NavbarComponent,
    FooterComponent,
    LoadingCardComponent,
  ],
})
export class SharedUiModule {}
