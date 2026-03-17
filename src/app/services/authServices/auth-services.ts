import { inject, Injectable } from '@angular/core';
import { AuthLogin } from '../../model/interfaces/auth.interface';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class AuthServices {
   private http = inject(HttpClient);
   private apiUrl = environment.apiUrl;

     LoginInfo(userData : AuthLogin){
        return this.http.post<AuthLogin>(`${this.apiUrl}/api/login` , userData).pipe(
          tap((response : any)=> {
              console.log('Login Response:', response);
              const token = response.token || response.Token;
              if (token) {
                  localStorage.setItem('authToken' , token);
                  // Store user specific details if available
                  const userDetails = {
                    firstName: response.firstName || response.name || response.userName || 'User',
                    email: response.email || userData.email,
                    role: response.role || 'Member'
                  };
                  localStorage.setItem('userData', JSON.stringify(userDetails));
                  console.log('Token and user data stored!');
              } else {
                  console.error('No token found in login response!');
              }
          }),
         catchError((err : any) => {
            console.log(err.error.message);
            return throwError(() => err)
         })
        );
     }

     getUserData() {
       const data = localStorage.getItem('userData');
       return data ? JSON.parse(data) : null;
     }

    Logout() {
      return this.http.post(`${this.apiUrl}/api/auth/logout`, {}).pipe(
        tap(() => {
          localStorage.removeItem('authToken');
          console.log('User logged out, token removed.');
        })
      );
    }

    isLoggedIn(): boolean {
      return !!localStorage.getItem('authToken');
    }
}
