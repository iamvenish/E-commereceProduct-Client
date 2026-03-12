import { Injectable, signal, computed, inject } from '@angular/core';
import { HandleService } from '../handleServices/handle-service';

export interface CartItem {
    id?: number;
    productName?: string;
    price?: string | number;
    originalPrice?: string | number;
    discountPercentage?: number;
    imageUrl?: string;
    category?: string;
    rating?: string | number;
    quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
    private handleService = inject(HandleService);
    private _items = signal<CartItem[]>([]);

    // Public read-only view
    items = this._items.asReadonly();

    totalCount = computed(() =>
        this._items().reduce((sum, item) => sum + item.quantity, 0)
    );

    totalPrice = computed(() =>
        this._items().reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
    );

    loadCart(): void {
        this.handleService.getCartProducts().subscribe({
            next: (items) => {
                // Ensure the items are in the correct format for the cart
                const mapped = (items || []).map((p: any) => ({
                    ...p,
                    id: p.id || p.productId || p.Id,
                    quantity: p.quantity || 1
                }));
                this._items.set(mapped);
            },
            error: (err) => console.error('Failed to load cart from backend:', err)
        });
    }

    addToCart(product: any): void {
        const current = this._items();
        const existing = current.find(i => i.id === product.id);

        // Local state update (immediate feedback)
        if (existing) {
            this._items.set(
                current.map(i =>
                    i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
                )
            );
        } else {
            this._items.set([...current, { ...product, quantity: 1 }]);
        }

        // Backend sync (background process)
        if (product.id) {
            this.handleService.addToCart(product, product.id.toString()).subscribe({
                next: (res) => console.log('Added to backend cart:', res),
                error: (err) => console.error('Failed to add to backend cart:', err)
            });
        }
    }

    removeFromCart(id: number | undefined): void {
        this._items.set(this._items().filter(i => i.id !== id));
    }

    updateQuantity(id: number | undefined, quantity: number): void {
        if (quantity <= 0) {
            this.removeFromCart(id);
            return;
        }
        this._items.set(
            this._items().map(i => (i.id === id ? { ...i, quantity } : i))
        );
    }

    clearCart(): void {
        this._items.set([]);
    }
}
