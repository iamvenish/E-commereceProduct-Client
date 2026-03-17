import { Injectable, signal, computed, inject } from '@angular/core';
import { HandleService } from '../handleServices/handle-service';

export interface CartItem {
    id?: number | string;
    addToCartId?: string;
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
            next: (response: any) => {
                const items = response?.data || response || [];

                const mapped = items.map((p: any) => ({
                    id: p.id || p.productId || p.Id,
                    addToCartId: p.addToCartId,
                    productName: p.addToCartProductName || p.productName || p.ProductName || 'Unnamed',
                    price: p.price || 0,
                    originalPrice: p.addToCartOriginalPrice || p.originalPrice || p.OriginalPrice || 0,
                    discountPercentage: p.addToCartDiscountOff || p.discountOff || p.percentage || 0,
                    quantity: p.addToCartQuantity || p.quantity || 1,
                    imageUrl: p.addToCartImage || p.addToCartImageUrl || p.imageUrl || p.ImageUrl || p.image || p.Image || '',
                    category: p.addToCartCategory || p.category || p.Category || ''
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
                next: (res) => {
                    console.log('Added to backend cart:', res);
                    this.loadCart(); // Reload to get addToCartId for future operations
                },
                error: (err) => console.error('Failed to add to backend cart:', err)
            });
        }
    }

    incrementQuantity(item: CartItem): void {
        const id = item.id;
        // Immediate local update
        this._items.set(
            this._items().map(i => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i))
        );

        // Backend sync
        if (item.addToCartId) {
            this.handleService.incrementCartItem(item.addToCartId).subscribe({
                next: (res) => console.log('Incremented on backend:', res),
                error: (err) => console.error('Failed to increment on backend:', err)
            });
        }
    }

    decrementQuantity(item: CartItem): void {
        const id = item.id;
        if (item.quantity <= 1) {
            this.removeFromCart(item.addToCartId || item.id);
            return;
        }

        // Immediate local update
        this._items.set(
            this._items().map(i => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        );

        // Backend sync
        if (item.addToCartId) {
            this.handleService.decrementCartItem(item.addToCartId).subscribe({
                next: (res) => console.log('Decremented on backend:', res),
                error: (err) => console.error('Failed to decrement on backend:', err)
            });
        }
    }

    removeFromCart(id: number | string | undefined): void {
        const itemToRemove = this._items().find(i => i.id === id || i.addToCartId === id);
        const finalId = itemToRemove?.addToCartId || id;

        // Immediate local update
        this._items.set(this._items().filter(i => i.id !== id && i.addToCartId !== id));

        // Backend sync
        if (finalId) {
            this.handleService.deleteCartItem(finalId.toString()).subscribe({
                next: (res) => {
                    console.log('Removed from backend cart:', res);
                },
                error: (err) => {
                    console.error('Failed to remove from backend cart:', err);
                    // Optionally: reload cart if sync fails to ensure consistency
                    // this.loadCart();
                }
            });
        }
    }

    updateQuantity(id: number | string | undefined, quantity: number): void {
        // Legacy method, keep but redirect or update if needed
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
