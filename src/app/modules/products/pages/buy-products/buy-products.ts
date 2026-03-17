import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HandleService } from '../../../../services/handleServices/handle-service';
import { ToastService } from '../../../../services/toast/toast.service';

export interface BuyProductItem {
  id?: number | string;
  productName?: string;
  price?: string | number;
  originalPrice?: string | number;
  imageUrl?: string;
}

@Component({
  selector: 'app-buy-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buy-products.html',
  styleUrl: './buy-products.scss'
})
export class BuyProducts implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private handleService = inject(HandleService);
  private toastService = inject(ToastService);

  productId: string | null = null;
  productDetails = signal<BuyProductItem | null>(null);
  isLoading = signal(true);
  isPurchasing = signal(false);

  // Form Details
  storeAddress = signal('');
  mobileNumber = signal('');
  saveAddress = signal(false);

  // Payment Accordion State
  activePaymentMethod = signal<string>(''); // 'premium_balance', 'debit_card', 'credit_card', 'upi'

  // Payment Form Details
  debitCard = {
    holderName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  };

  creditCard = {
    holderName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  };

  upiId = '';
  premiumBalance = signal(0); // Initially 0 as requested

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.fetchProductDetails(this.productId);
    } else {
      this.toastService.showError('Invalid Product.');
      this.router.navigate(['/product']);
    }
  }

  fetchProductDetails(id: string) {
    this.isLoading.set(true);
    // Use getProductById to fetch details for purchase overview
    this.handleService.getProductById(id).subscribe({
      next: (res: any) => {
        // Backend returns an array or single object
        const product = Array.isArray(res) ? res[0] : (res?.data || res);
        
        if (product) {
           this.productDetails.set({
              id: product.id || product.Id || product.productId,
              productName: product.productName || product.ProductName || product.title,
              price: product.price || product.Price || 0,
              originalPrice: product.orginalPrice || product.originalPrice || product.MRP || 0,
              imageUrl: product.imageUrl || product.ImageUrl || product.image || ''
           });
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastService.showError('Failed to load product details.');
        this.isLoading.set(false);
        this.router.navigate(['/product']);
      }
    });
  }

  togglePaymentMethod(method: string) {
    if (this.activePaymentMethod() === method) {
      this.activePaymentMethod.set(''); // Collapse if already open
    } else {
      this.activePaymentMethod.set(method);
    }
  }

  confirmPurchase() {
    if (!this.storeAddress() || !this.mobileNumber()) {
      this.toastService.showError('Please provide Address and Mobile Number.');
      return;
    }

    if (!this.activePaymentMethod()) {
      this.toastService.showError('Please select a Payment Method.');
      return;
    }

    // Basic Validations
    if (this.activePaymentMethod() === 'debit_card' && (!this.debitCard.cardNumber || !this.debitCard.holderName)) {
      this.toastService.showError('Please fill in Debit Card details.');
      return;
    }
    
    if (this.activePaymentMethod() === 'credit_card' && (!this.creditCard.cardNumber || !this.creditCard.holderName)) {
      this.toastService.showError('Please fill in Credit Card details.');
      return;
    }

    if (this.activePaymentMethod() === 'upi' && !this.upiId) {
      this.toastService.showError('Please enter UPI ID.');
      return;
    }

    if (this.activePaymentMethod() === 'premium_balance' && this.premiumBalance() < Number(this.productDetails()?.price)) {
      this.toastService.showError('Insufficient PremiumStore Pay Balance.');
      return;
    }

    this.isPurchasing.set(true);

    const payload = {
        storeAddress: this.storeAddress(),
        mobileNumber: this.mobileNumber(),
        saveAddress: this.saveAddress(),
        paymentMethod: this.activePaymentMethod(),
        productId: this.productId,
        productName: this.productDetails()?.productName,
        amount: this.productDetails()?.price
    };

    // Simulate final payment checkout since no specific payment API was provided
    setTimeout(() => {
        this.toastService.showSuccess('Payment successful! Thank you for your order.');
        this.isPurchasing.set(false);
        this.router.navigate(['/product']); // Redirect to catalog or orders page
    }, 1500);
  }

  goBack() {
    this.router.navigate(['/product']);
  }

  // Helper Methods for Template
  getNumberPrice(price: string | number | undefined): number {
    return Number(price) || 0;
  }

  hasDiscount(): boolean {
    const details = this.productDetails();
    if (!details) return false;
    const orig = Number(details.originalPrice) || 0;
    const curr = Number(details.price) || 0;
    return orig > curr;
  }

  getFormattedDiscount(): string {
    const details = this.productDetails();
    if (!details) return '0.00';
    const orig = Number(details.originalPrice) || 0;
    const curr = Number(details.price) || 0;
    return (orig - curr).toFixed(2);
  }
}

