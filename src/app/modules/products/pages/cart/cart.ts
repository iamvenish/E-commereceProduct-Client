import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../../../services/cart/cart.service';
import { HandleService } from '../../../../services/handleServices/handle-service';
import { ToastService } from '../../../../services/toast/toast.service';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './cart.html',
    styleUrl: './cart.scss',
})
export class Cart implements OnInit {
    private cartService = inject(CartService);
    private router = inject(Router);
    private handleService = inject(HandleService);
    private toastService = inject(ToastService);

    cartItems = this.cartService.items;
    totalCount = this.cartService.totalCount;
    totalPrice = this.cartService.totalPrice;

    isCheckingOut = false; // To handle loading state

    ngOnInit(): void {
        this.cartService.loadCart();
    }

    savedAmount = computed(() => {
        return this.cartService.items().reduce((sum, item) => {
            const original = Number(item.originalPrice) || Number(item.price);
            const current = Number(item.price);
            return sum + (original - current) * item.quantity;
        }, 0);
    });

    increase(item: any) {
        this.cartService.incrementQuantity(item);
    }

    decrease(item: any) {
        this.cartService.decrementQuantity(item);
    }

    remove(item: any) {
        this.cartService.removeFromCart(item.addToCartId || item.id);
    }

    goBack() {
        this.router.navigate(['/product']);
    }

    checkout() {
        if (this.totalCount() === 0) return;

        this.isCheckingOut = true;
        this.toastService.showSuccess(`Initiating checkout for ${this.totalCount()} items...`);

        // Get the first item to pass to the API and checkout routing.
        // In a real app we'd pass a cart ID or list, but based on the requested flow
        // passing an ID similar to "buyProduct" is what was asked.
        const firstItem = this.cartItems()[0];

        if (!firstItem) return;

        // Using the same API call style as product page as requested
        const itemId = firstItem.id ? firstItem.id.toString() : '';
        this.handleService.buyProduct(itemId, {
            items: this.cartItems(),
            totalPrice: this.totalPrice()
        }).subscribe({
            next: (res: any) => {
                this.router.navigate(['/product/buy-product', itemId]);
                this.isCheckingOut = false;
            },
            error: (err: any) => {
                this.toastService.showError('Failed to initiate checkout.');
                this.isCheckingOut = false;
            }
        });
    }
}
