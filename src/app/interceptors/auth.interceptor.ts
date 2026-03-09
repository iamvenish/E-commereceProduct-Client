import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('authToken');
  const isLogin = req.url.includes('/api/login');

  if (isLogin) {
    console.log(`[AuthInterceptor] 🔑 Login request detected. Skipping token injection (user is authenticating).`);
    return next(req);
  }

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log(`[AuthInterceptor] 🛡️ Token attached to: ${req.url}`);
    return next(cloned);
  } else {
    console.warn(`[AuthInterceptor] ⚠️ No token found in storage for: ${req.url}`);
  }
  
  return next(req);
};
