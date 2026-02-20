import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/user/auth.service';

/**
 * Interceptor que adiciona o header Authorization: Bearer <token>
 * para chamadas a /api/**, excepto endpoints de autenticação.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiRequest = req.url.startsWith('/api/');
  const isAuthEndpoint = req.url.startsWith('/api/auth/login') || req.url.startsWith('/api/auth/register');

  if (!isApiRequest || isAuthEndpoint) {
    return next(req);
  }


  // Usar injeção Angular para obter o AuthService
  const authService = (typeof inject === 'function') ? inject(AuthService) : new AuthService();
  const user = authService.getUser();
  const token = user?.token;


  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
