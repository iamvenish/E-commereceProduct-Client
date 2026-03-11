import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../../../services/cart/cart.service';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './cart.html',
    styleUrl: './cart.scss',
})
export class Cart {
    private cartService = inject(CartService);
    private router = inject(Router);

    cartItems = this.cartService.items;
    totalCount = this.cartService.totalCount;
    totalPrice = this.cartService.totalPrice;

    savedAmount = computed(() => {
        return this.cartService.items().reduce((sum, item) => {
            const original = Number(item.originalPrice) || Number(item.price);
            const current = Number(item.price);
            return sum + (original - current) * item.quantity;
        }, 0);
    });

    increase(item: any) {
        this.cartService.updateQuantity(item.id, item.quantity + 1);
    }

    decrease(item: any) {
        this.cartService.updateQuantity(item.id, item.quantity - 1);
    }

    remove(item: any) {
        this.cartService.removeFromCart(item.id);
    }

    goBack() {
        this.router.navigate(['/product']);
    }
}
