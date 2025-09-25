import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_CONFIG } from '../tokens';
import { CurrentUser } from '../models';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
}

@Injectable()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiConfig = inject(API_CONFIG);
  private readonly storageKey = 'currentUser';
  private readonly apiRoot = this.apiConfig.URL.replace(/\/+$/, '');

  authedUser = signal<CurrentUser | null | undefined>(undefined);

  constructor() {
    const stored = this.readStoredUser();
    this.authedUser.set(stored ?? null);
  }

  get currentUser(): CurrentUser | null | undefined {
    return this.authedUser();
  }

  set currentUser(user: CurrentUser | null | undefined) {
    this.persistUser(user ?? null);
  }

  login(email: string, password: string): Promise<CurrentUser> {
    return firstValueFrom(
      this.http.post<LoginResponse>(this.buildUrl('/auth/login'), { email, password })
    )
      .then((response) => {
        const currentUser: CurrentUser = {
          id: response.user.id,
          email: response.user.email,
          fullName: response.user.name,
          accessToken: response.token,
        };

        this.persistUser(currentUser);
        return currentUser;
      })
      .catch((error) => {
        console.error('Giriş hatası', error);
        throw error;
      });
  }

  register(email: string, password: string, name?: string) {
    return firstValueFrom(
      this.http.post<RegisterResponse>(this.buildUrl('/auth/register'), {
        email,
        password,
        name,
      })
    ).catch((error) => {
      console.error('Kayıt hatası', error);
      throw error;
    });
  }

  logout(): void {
    this.persistUser(null);
  }

  getAccessToken(): string | null {
    const current = this.authedUser();
    if (current?.accessToken) {
      return current.accessToken;
    }

    const stored = this.readStoredUser();
    if (!stored?.accessToken) {
      this.authedUser.set(null);
      return null;
    }

    this.authedUser.set(stored);
    return stored.accessToken;
  }

  private buildUrl(path: string): string {
    return `${this.apiRoot}${path}`;
  }

  private readStoredUser(): CurrentUser | null {
    const userJson = localStorage.getItem(this.storageKey);
    if (!userJson) {
      return null;
    }

    try {
      return JSON.parse(userJson) as CurrentUser;
    } catch (error) {
      console.warn('Önbellekteki currentUser çözümlenemedi', error);
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }

  private persistUser(user: CurrentUser | null): void {
    if (user) {
      localStorage.setItem(this.storageKey, JSON.stringify(user));
      this.authedUser.set(user);
    } else {
      localStorage.removeItem(this.storageKey);
      this.authedUser.set(null);
    }
  }
}
