import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { showToast } from '../ui/toast.helper';

type ErrorCategory =
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'client'
  | 'server'
  | 'unknown';

const classifyError = (error: HttpErrorResponse): ErrorCategory => {
  if (error.status === 0) {
    return 'network';
  }

  if (error.status === 401) {
    return 'unauthorized';
  }

  if (error.status === 403) {
    return 'forbidden';
  }

  if (error.status === 404) {
    return 'notFound';
  }

  if (error.status >= 400 && error.status < 500) {
    return 'client';
  }

  if (error.status >= 500) {
    return 'server';
  }

  return 'unknown';
};
const withDetail = (base: string, detail?: string): string =>
  detail ? `${base}: ${detail}` : base;

const buildToastOptions = (
  category: ErrorCategory
): { type: 'info' | 'warning' | 'error'; message: string } => {
  const baseMessage = 'There was a problem. Please try again.';

  switch (category) {
    case 'network':
      return {
        type: 'error',
        message: withDetail('Network error. Please check your connection'),
      };
    case 'unauthorized':
      return {
        type: 'warning',
        message: withDetail('Authentication required. Please sign in again'),
      };
    case 'forbidden':
      return {
        type: 'warning',
        message: withDetail('You do not have permission to perform this action'),
      };
    case 'notFound':
      return {
        type: 'info',
        message: withDetail('Requested resource could not be found'),
      };
    case 'client':
      return {
        type: 'warning',
        message: withDetail('Request could not be processed'),
      };
    case 'server':
      return {
        type: 'error',
        message: withDetail('Server error. Please try again later'),
      };
    default:
      return {
        type: 'error',
        message: withDetail('Unexpected error occurred'),
      };
  }
};

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const category = classifyError(error);
      const message = `${req.method} ${req.url} failed with status ${error.status} (${category})`;
      const toastOptions = buildToastOptions(category);

      showToast(toastOptions.message, toastOptions.type);

      switch (category) {
        case 'network':
          console.warn('[HTTP][Network]', message, error.message);
          break;
        case 'unauthorized':
          console.warn('[HTTP][Unauthorized]', message, error.error ?? error.message);
          break;
        case 'forbidden':
          console.warn('[HTTP][Forbidden]', message, error.error ?? error.message);
          break;
        case 'notFound':
          console.info('[HTTP][NotFound]', message, error.error ?? error.message);
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
