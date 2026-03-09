import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [class]="toast.type" (click)="toastService.remove(toast.id)">
          <div class="toast-icon">
            @if (toast.type === 'success') { ✓ }
            @else if (toast.type === 'error') { ✕ }
            @else { ℹ }
          </div>
          <div class="toast-content">
            {{ toast.message }}
          </div>
          <button class="toast-close">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 2rem;
      right: 2rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      pointer-events: none;
    }

    .toast-item {
      pointer-events: auto;
      min-width: 300px;
      padding: 1rem 1.25rem;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 1rem;
      color: white;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      transition: all 0.2s;

      &:hover {
        transform: translateY(-2px);
        background: rgba(15, 23, 42, 0.9);
      }

      &.success {
        border-left: 4px solid #10b981;
        .toast-icon { color: #10b981; }
      }

      &.error {
        border-left: 4px solid #ef4444;
        .toast-icon { color: #ef4444; }
      }

      &.info {
        border-left: 4px solid #3b82f6;
        .toast-icon { color: #3b82f6; }
      }
    }

    .toast-icon {
      font-size: 1.25rem;
      font-weight: bold;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toast-content {
      flex: 1;
      font-size: 0.95rem;
      font-weight: 500;
      letter-spacing: 0.01em;
    }

    .toast-close {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.4);
      font-size: 1.25rem;
      padding: 0;
      cursor: pointer;
      line-height: 1;
      
      &:hover { color: white; }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(40px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
