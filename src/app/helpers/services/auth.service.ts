import { inject, Injectable, signal } from '@angular/core';
import { CurrentUser } from '../models';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  authApiUrl = 'http://localhost:3000/graphql'; // Gerçek API adresinizle değiştirin
  constructor() {}
  http = inject(HttpClient);

  authedUser = signal<CurrentUser | null | undefined>(undefined);

  get currentUser(): CurrentUser | null | undefined {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? (JSON.parse(userJson) as CurrentUser) : null;
  }

  set currentUser(user: CurrentUser | null | undefined) {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.authedUser.set(user);
    } else {
      localStorage.removeItem('currentUser');
      this.authedUser.set(null);
    }
  }

  login(email: string, password: string) {
    const query = `
      mutation Login($loginInput: LoginInput!) {
        login(loginInput: $loginInput) {
          id
          email
          fullName
          accessToken
          refreshToken
        }
      }
    `;

    const variables = {
      loginInput: {
        email,
        password,
      },
    };

    return firstValueFrom(
      this.http.post<any>(this.authApiUrl, {
        query,
        variables,
      })
    )
      .then((response) => {
        const user = response.data.login as CurrentUser;
        this.currentUser = user;
        return user;
      })
      .catch((error) => {
        console.error('Giriş hatası', error);
        throw error;
      });
  }

  register(email: string, password: string): void {
    // Kayıt mantığını burada uygulayın
    console.log('Şu bilgilerle kayıt olunuyor', email, password);
  }

  getAccessToken(): string | null {
    if (this.currentUser?.accessToken) {
      return this.currentUser.accessToken;
    }

    const cachedUser = localStorage.getItem('currentUser');
    if (!cachedUser) return null;

    try {
      const parsed = JSON.parse(cachedUser) as CurrentUser | null;
      this.currentUser = parsed ?? undefined;
      return parsed?.accessToken ?? null;
    } catch (error) {
      console.warn('Önbellekteki currentUser çözümlenemedi', error);
      return null;
    }
  }
}
