import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/user/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  
  if (req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register')) {
    console.log('[authInterceptor] Ignorado:', req.url);
    return next(req);
  }

  const authService = inject(AuthService);
  const user = authService.getUser();

  if (user && user.token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${user.token}`
      }
    });
    console.log('[authInterceptor] Token enviado para:', req.url);
    return next(authReq);
  }

  return next(req);
};
