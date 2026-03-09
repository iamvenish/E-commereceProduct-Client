import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HandleService } from '../../../../services/handleServices/handle-service';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ProductItem } from '../product/product';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../services/toast/toast.service';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-edit.html',
  styleUrl: './product-edit.scss',
})
export class ProductEdit implements OnInit {
  private handleService = inject(HandleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ToastService);

  product = signal<ProductItem | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  productId !: string;

  productInfo = new FormGroup({
    productName: new FormControl('', [Validators.required]),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    rating: new FormControl<number | null>(null, [Validators.required, Validators.min(1), Validators.max(5)]),
    category: new FormControl('Accessories', [Validators.required]),
    imageUrl: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
  });

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id')!;

    if (this.productId) {
      this.loadProduct(this.productId);
    }
  }

  loadProduct(id: string) {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.handleService.getProductById(id).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response: any) => {
        const productData = Array.isArray(response) ? response[0] : response;
        this.product.set(productData);
        if (productData) {
          this.productInfo.patchValue(productData);
        }
      },
      error: (err: any) => {
        const msg = err.error?.message || err.message || 'Failed to load product details';
        this.errorMessage.set(msg);
        console.error('Error fetching product details:', err);
      }
    });
  }

  updateProduct() {
    if (this.productInfo.invalid) return;

    this.isLoading.set(true);
    this.handleService.updateProduct(this.productInfo.value, this.productId).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const successMsg = response?.message || 'Product updated successfully!';
        this.toastService.showSuccess(successMsg);
        console.log('Update Response:', response);
        this.router.navigate(['/product']);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        const errorMsg = err.error?.message || err.message || 'Failed to update product';
        this.toastService.showError(errorMsg);
        console.error('Update Error:', err);
      }
    });
  }

  goBack() {
    this.router.navigate(['/product']);
  }
}
