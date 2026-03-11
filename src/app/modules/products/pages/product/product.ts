import { Component, inject, signal, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HandleService } from '../../../../services/handleServices/handle-service';
import { AuthServices } from '../../../../services/authServices/auth-services';
import { ToastService } from '../../../../services/toast/toast.service';
import { CartService } from '../../../../services/cart/cart.service';
import { ConfirmModal } from '../../../../shared/components/confirm-modal/confirm-modal';
import { finalize } from 'rxjs';

export interface ProductItem {
  id?: number;
  productName?: string;
  price?: string | number;
  originalPrice?: string | number;
  discountPercentage?: number;
  rating?: string | number;
  imageUrl?: string;
  description?: string;
  category?: string;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, ConfirmModal],
  templateUrl: './product.html',
  styleUrl: './product.scss',
})
export class Product implements OnInit {
  private handleService = inject(HandleService);
  private authService = inject(AuthServices);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private cartService = inject(CartService);

  cartCount = this.cartService.totalCount;

  productDetails = signal<ProductItem[]>([]);
  userData = signal<any>(null);
  isLoading = signal(false);
  showDeleteModal = signal(false);
  selectedProduct = signal<ProductItem | null>(null);
  touchedCardId = signal<number | string | null>(null);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // If click is NOT inside a .product-card, close any open touched card
    if (!target.closest('.product-card')) {
      this.touchedCardId.set(null);
    }
  }

  ngOnInit() {
    this.loadUserData();
    this.productInfo();
  }

  loadUserData() {
    const data = this.authService.getUserData();
    if (data) {
      this.userData.set(data);
    }
  }

  getUserInitial(): string {
    const name = this.userData()?.firstName || 'U';
    return name.charAt(0).toUpperCase();
  }

  productInfo() {
    this.isLoading.set(true);
    this.handleService.GetProductsDetails().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (response: any) => {
        let products = [];
        if (Array.isArray(response)) {
          products = response;
        } else if (response && typeof response === 'object') {
          products = response.data || response.products || response.productDetails || [];
        }

        // Robust Sorting and Mapping
        products = products.map((p: any) => {
          const currentPrice = Number(p.price || p.Price || 0);
          const backendOriginalPrice = Number(p.originalPrice || p.OriginalPrice || p.mrp || p.MRP || 0);
          const originalPrice = backendOriginalPrice > currentPrice ? backendOriginalPrice : (currentPrice > 0 ? (currentPrice * 10 / 7).toFixed(2) : 0);
          const discountPercentage = (Number(originalPrice) > currentPrice) ? Math.round(((Number(originalPrice) - currentPrice) / Number(originalPrice)) * 100) : 0;

          return {
            ...p,
            id: p.id || p.Id || p.productId,
            productName: p.productName || p.ProductName || p.title || 'Unnamed Product',
            price: currentPrice,
            originalPrice: Number(originalPrice).toFixed(2),
            discountPercentage: discountPercentage,
            rating: p.rating || p.Rating || 0,
            imageUrl: p.imageUrl || p.ImageUrl || p.image || '',
            description: p.description || p.Description || '',
            category: p.category || p.Category || 'General'
          };
        }).sort((a: any, b: any) => (Number(b.id) || 0) - (Number(a.id) || 0));

        this.productDetails.set(products);
      },
      error: (err) => {
        this.toastService.showError('Failed to load products');
      }
    });
  }

  /** Toggle the touch-hover state on a card. Tapping the same card twice closes it. */
  toggleCardTouch(item: ProductItem, event: MouseEvent) {
    event.stopPropagation();
    const id = item.id ?? item.productName ?? null;
    this.touchedCardId.set(this.touchedCardId() === id ? null : id);
  }

  onAdd() {
    this.router.navigate(['/product/add']);
  }

  onLogout() {
    this.authService.Logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => {
        this.toastService.showError('Logout failed');
      }
    });
  }

  onEdit(item: ProductItem) {
    this.router.navigate(['/product/edit', item.id]);
  }

  onDelete(item: ProductItem) {
    this.selectedProduct.set(item);
    this.showDeleteModal.set(true);
  }

  confirmDelete() {
    const product = this.selectedProduct();
    if (product?.id) {
      this.handleService.deleteProduct(product.id.toString()).subscribe({
        next: (response: any) => {
          this.toastService.showSuccess(response?.message || 'Product deleted');
          this.productInfo();
          this.cancelDelete();
        },
        error: (err) => {
          this.toastService.showError('Failed to delete product');
        }
      });
    }
  }

  cancelDelete() {
    this.showDeleteModal.set(false);
    this.selectedProduct.set(null);
  }

  onAddToCart(item: any) {
    this.cartService.addToCart(item);
    this.toastService.showSuccess(`🛒 ${item.productName} added to cart successfully!`);
  }

  goToCart() {
    this.router.navigate(['/product/cart']);
  }

  onBuyNow(item: any) {
    this.toastService.showSuccess(`Proceeding to buy ${item.productName}`);
  }
}
