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
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { OrderService } from './helpers/services/order.service';
import { authInterceptor } from './helpers/interceptors/auth.interceptor';
import { loggingInterceptor } from './helpers/interceptors/logging.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptors([loggingInterceptor, authInterceptor])),

    provideRouter(routes, withComponentInputBinding()),
    {
      provide: API_CONFIG,
      useValue: {
        URL: 'http://localhost:3000',
        API_KEY: 'your-api-key-here',
      },
    },
    ProductService,
    AuthService,
    OrderService,
  ],
};
