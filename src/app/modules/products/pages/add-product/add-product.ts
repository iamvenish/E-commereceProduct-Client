import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HandleService } from '../../../../services/handleServices/handle-service';
import { ToastService } from '../../../../services/toast/toast.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-product.html',
  styleUrl: './add-product.scss',
})
export class AddProduct {
  private handleService = inject(HandleService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  isLoading = signal(false);

  // URL Pattern for validation
  // Permissive URL Pattern that allows query parameters, modern TLDs, and common symbols
  private urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,63})([\/\w .?%&=~-]*)*\/?$/i;

  productInfo = new FormGroup({
    productName: new FormControl('', [
      Validators.required, 
      Validators.minLength(3), 
      Validators.maxLength(50)
    ]),
    price: new FormControl<number | null>(null, [
      Validators.required, 
      Validators.min(1)
    ]),
    rating: new FormControl<number>(5, [
      Validators.required, 
      Validators.min(1), 
      Validators.max(5)
    ]),
    category: new FormControl('Premium Collection', [Validators.required]),
    imageUrl: new FormControl('', [
      Validators.required, 
      Validators.pattern(this.urlPattern)
    ]),
    description: new FormControl('', [
      Validators.required, 
      Validators.minLength(10), 
      Validators.maxLength(500)
    ]),
  });

  isFieldInvalid(fieldName: string): boolean {
    const control = this.productInfo.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getErrorMessage(controlName: string, label: string): string {
    const control = this.productInfo.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return `${label} is required`;
    if (control.errors['minlength']) return `${label} must be at least ${control.errors['minlength'].requiredLength} characters`;
    if (control.errors['maxlength']) return `${label} cannot exceed ${control.errors['maxlength'].requiredLength} characters`;
    if (control.errors['min']) return `${label} must be at least ${control.errors['min'].min}`;
    if (control.errors['max']) return `${label} cannot exceed ${control.errors['max'].max}`;
    if (control.errors['pattern']) return `Please enter a valid URL`;

    return 'Invalid field';
  }

  onSubmit() {
    if (this.productInfo.invalid) {
      this.productInfo.markAllAsTouched();
      this.toastService.showError('Please fix the errors in the form before submitting.');
      return;
    }

    this.isLoading.set(true);
    this.handleService.addProduct(this.productInfo.value).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        this.toastService.showSuccess(response?.message || 'Product added successfully!');
        this.router.navigate(['/product']);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        const errorMsg = err.error?.message || err.message || 'Failed to add product';
        this.toastService.showError(errorMsg);
      }
    });
  }

  goBack() {
    this.router.navigate(['/product']);
  }
}
