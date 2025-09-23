import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { API_CONFIG } from './helpers/tokens';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: API_CONFIG,
      useValue: {
        URL: 'https://api.example.com',
        API_KEY: 'your-api-key-here',
      },
    },
  ],
};
