import { JsonPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarProductSelectComponent } from './navbar-product-select.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [RouterLink, JsonPipe, NavbarProductSelectComponent],
})
export class NavbarComponent implements OnInit {
  activatedRoute = inject(ActivatedRoute);

  productId = signal<number | null>(null);

  breadCrumbs: any[] = [];

  constructor() {}

  ngOnInit() {
    this.breadCrumbs = this.buildBreadcrumbs(this.activatedRoute);
  }
  buildBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: any[] = []): any[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      console.log('child route:', child.snapshot.url);
      const routeURL: string = child.snapshot.url.map((segment) => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      let label = child.snapshot.data['breadcrumb'];

      // Eğer product detail sayfasındaysak ve breadcrumb boşsa dinamik olarak isim al
      if (child.routeConfig?.path?.includes('products/:productId')) {
        const productId = child.snapshot.params['productId'];
        this.productId.set(+productId);
        label = `Ürün #${productId}`; // burada API’den ürün adı fetch edebilirsin
      }

      if (label) {
        breadcrumbs.push({ label, url });
      }

      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
