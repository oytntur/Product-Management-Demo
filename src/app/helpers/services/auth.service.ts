import { Injectable } from '@angular/core';
import { CurrentUser } from '../models';

@Injectable()
export class AuthService {
  constructor() {}

  currentUser?: CurrentUser;

  login(email: string, password: string): void {
    // Implement login logic here
    console.log('Logging in with', email, password);
  }

  register(email: string, password: string): void {
    // Implement registration logic here
    console.log('Registering with', email, password);
  }
}
