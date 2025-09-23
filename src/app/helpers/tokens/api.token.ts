import { InjectionToken } from '@angular/core';

export interface APIConfig {
  URL: string;
  API_KEY: string;
}

export const API_CONFIG = new InjectionToken<APIConfig>('API Config');
