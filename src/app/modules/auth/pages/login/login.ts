import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServices } from '../../../../services/authServices/auth-services';
import { AuthLogin } from '../../../../model/interfaces/auth.interface';
import { Router } from '@angular/router';
import { ToastService } from '../../../../services/toast/toast.service';
import { tap, finalize } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private authServices = inject(AuthServices);
  private route = inject(Router);
  private toastService = inject(ToastService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  userLoginInfo = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  UserData(): void {
    if (this.userLoginInfo.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      
      this.authServices.LoginInfo(this.userLoginInfo.value as AuthLogin).pipe(
        finalize(() => this.isLoading.set(false))
      ).subscribe({
        next: (response: any) => {
          console.log('Login successful', response);
          this.toastService.showSuccess(response?.message || 'Login successful!');
          this.route.navigate(['product']);
        },
        error: (err) => {
          console.error('Login error:', err);
          const msg = err.error?.message || 'Invalid email or password. Please try again.';
          this.errorMessage.set(msg);
          this.toastService.showError(msg);
        }
      });
    } else {
      this.userLoginInfo.markAllAsTouched();
    }
  }
}
