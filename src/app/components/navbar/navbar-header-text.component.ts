import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar-header-text',
  template: '<h3 class="navigation-title">{{ title() }}</h3>',
  styles: [
    `
      .navigation-title {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        letter-spacing: 0.02em;
        color: #fff;
      }
    `,
  ],
})
export class NavbarHeaderTextComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  title = signal('');

  constructor() {
    this.title.set(this.resolveTitle());

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => {
        this.title.set(this.resolveTitle());
      });
  }

  private resolveTitle(): string {
    let route: ActivatedRoute | null = this.activatedRoute;

    // Walk up to the root route first so we cover the full tree.
    while (route?.parent) {
      route = route.parent;
    }

    let discoveredTitle = '';

    while (route) {
      const snapshot = route.snapshot;
      const snapshotTitle = this.readSnapshotTitle(snapshot);
      if (snapshotTitle) {
        discoveredTitle = snapshotTitle;
      }
      route = route.firstChild ?? null;
    }

    return discoveredTitle;
  }

  private readSnapshotTitle(snapshot: ActivatedRouteSnapshot): string {
    const fromTitle = snapshot.title;
    if (typeof fromTitle === 'string' && fromTitle.length > 0) {
      return fromTitle;
    }

    const fromData = snapshot.data?.['title'];
    if (typeof fromData === 'string' && fromData.length > 0) {
      return fromData;
    }

    return '';
  }
}
