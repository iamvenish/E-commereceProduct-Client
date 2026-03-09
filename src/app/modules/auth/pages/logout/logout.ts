import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthServices } from '../../../../services/authServices/auth-services';
import { ToastService } from '../../../../services/toast/toast.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logout.html',
  styleUrl: './logout.scss'
})
export class Logout implements OnInit {
  private authServices = inject(AuthServices);
  private router = inject(Router);
  private toastService = inject(ToastService);

  isError = signal(false);
  errorMessage = signal('');

  ngOnInit() {
    this.performLogout();
  }

  performLogout() {
    this.isError.set(false);
    this.authServices.Logout().subscribe({
      next: (response: any) => {
        this.toastService.showSuccess(response?.message || 'Signed out successfully');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isError.set(true);
        this.errorMessage.set(err.error?.message || 'Server logout failed');
        console.error('Logout API failed:', err);
        this.toastService.showError(this.errorMessage());
      }
    });
  }

  forceLogout() {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }
}
