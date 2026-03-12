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
    private _items = signal<CartItem[]>(this.loadFromStorage());

    // Public read-only view
    items = this._items.asReadonly();

    totalCount = computed(() =>
        this._items().reduce((sum, item) => sum + item.quantity, 0)
    );

    totalPrice = computed(() =>
        this._items().reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
    );

    private loadFromStorage(): CartItem[] {
        const saved = localStorage.getItem('cart_items');
        return saved ? JSON.parse(saved) : [];
    }

    private saveToStorage(items: CartItem[]): void {
        localStorage.setItem('cart_items', JSON.stringify(items));
    }

    addToCart(product: any): void {
        const current = this._items();
        const existing = current.find(i => i.id === product.id);
        let updated: CartItem[];

        // Local state update (immediate feedback)
        if (existing) {
            updated = current.map(i =>
                i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            );
        } else {
            updated = [...current, { ...product, quantity: 1 }];
        }

        this._items.set(updated);
        this.saveToStorage(updated);

        // Backend sync (background process)
        if (product.id) {
            this.handleService.addToCart(product, product.id.toString()).subscribe({
                next: (res) => console.log('Added to backend cart:', res),
                error: (err) => console.error('Failed to add to backend cart:', err)
            });
        }
    }

    removeFromCart(id: number | undefined): void {
        const updated = this._items().filter(i => i.id !== id);
        this._items.set(updated);
        this.saveToStorage(updated);
    }

    updateQuantity(id: number | undefined, quantity: number): void {
        if (quantity <= 0) {
            this.removeFromCart(id);
            return;
        }
        const updated = this._items().map(i => (i.id === id ? { ...i, quantity } : i));
        this._items.set(updated);
        this.saveToStorage(updated);
    }

    clearCart(): void {
        this._items.set([]);
        localStorage.removeItem('cart_items');
    }
}
