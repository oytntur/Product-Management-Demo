import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

const classifyError = (error: HttpErrorResponse): string => {
  if (error.status === 0) {
    return 'network';
  }

  if (error.status >= 400 && error.status < 500) {
    return 'client';
  }

  if (error.status >= 500) {
    return 'server';
  }

  return 'unknown';
};

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const category = classifyError(error);
      const message = `${req.method} ${req.url} failed with status ${error.status} (${category})`;

      switch (category) {
        case 'network':
          console.warn('[HTTP][Network]', message, error.message);
          break;
        case 'client':
          console.info('[HTTP][Client]', message, error.error ?? error.message);
          break;
        case 'server':
          console.error('[HTTP][Server]', message, error.error ?? error.message);
          break;
        default:
          console.debug('[HTTP][Unknown]', message, error);
      }

      return throwError(() => error);
    })
  );
};
