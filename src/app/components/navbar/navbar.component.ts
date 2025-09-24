import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavbarProductSelectComponent } from './navbar-product-select.component';
import { NavbarHeaderTextComponent } from './navbar-header-text.component';
import { AuthService } from '../../helpers/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [NgComponentOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  readonly headerComponent = computed(() =>
    this.currentUrl().match(/^\/admin\/products\/\d+$/)
      ? NavbarProductSelectComponent
      : NavbarHeaderTextComponent
  );

  readonly currentUser = this.authService.authedUser;

  constructor() {
    console.log('aaaaaaaaa', this.currentUrl().match(/^\/admin\/products\/\d+$/));
  }
}
