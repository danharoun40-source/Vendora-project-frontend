import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message =
        error.error?.message || error.message || 'Something went wrong. Please try again.';

      if (error.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        auth.logout();
      } else if (error.status === 403) {
        toast.error('Access denied.');
      } else if (error.status === 0) {
        toast.error('Cannot reach the server. Please check your connection.');
      } else {
        toast.error(message);
      }

      return throwError(() => error);
    })
  );
};
