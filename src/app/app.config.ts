import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { API_CONFIG } from './helpers/tokens';
import { ProductService } from './helpers/services/product.service';
import { AuthService } from './helpers/services/auth.service';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),

    provideRouter(routes, withComponentInputBinding()),
    {
      provide: API_CONFIG,
      useValue: {
        URL: 'https://northwind.vercel.app/api',
        API_KEY: 'your-api-key-here',
      },
    },
    ProductService,
    AuthService,
  ],
};
