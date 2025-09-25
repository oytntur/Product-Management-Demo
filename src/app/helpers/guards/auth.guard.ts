import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanMatch,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from '@angular/router';

import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild, CanMatch {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.ensureAuthenticated(state.url);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return this.ensureAuthenticated(state.url);
  }

  canMatch(route: Route, segments: UrlSegment[]): boolean | UrlTree {
    const attemptedUrl = '/' + segments.map((segment) => segment.path).join('/');
    return this.ensureAuthenticated(attemptedUrl);
  }

  private ensureAuthenticated(redirectUrl?: string): boolean | UrlTree {
    if (this.hasUser()) {
      return true;
    }

    return this.router.createUrlTree(['/auth/login'], {
      queryParams: redirectUrl ? { redirectUrl } : undefined,
    });
  }

  private hasUser(): boolean {
    console.log;
    if (this.authService.currentUser) {
      return true;
    }

    this.authService.getAccessToken();
    return !!this.authService.currentUser;
  }
}
