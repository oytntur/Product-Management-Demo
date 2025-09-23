import { inject, Injectable } from '@angular/core';
import { CurrentUser } from '../models';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  authApiUrl = 'http://localhost:3000/graphql'; // Replace with your actual API URL
  constructor() {}
  http = inject(HttpClient);

  currentUser?: CurrentUser;

  login(email: string, password: string) {
    const query = `
      mutation Login($loginInput: LoginInput!) {
        login(loginInput: $loginInput) {
          id
          email
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
    ).then((response) => {
      const user = response.data.login as CurrentUser;
      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));

      return user;
    });
  }

  register(email: string, password: string): void {
    // Implement registration logic here
    console.log('Registering with', email, password);
  }
}
