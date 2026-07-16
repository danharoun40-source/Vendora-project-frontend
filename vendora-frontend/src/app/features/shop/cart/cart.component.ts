import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/models/product.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

const DELIVERY_FEE = 30;

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loading = signal(true);
  deliveryFee = DELIVERY_FEE;

  cart = this.cartService.cart;

  subtotal = computed(() => {
    const c = this.cart();
    if (!c) return 0;
    return c.products.reduce((sum, item) => {
      const p = item.product as Product;
      return sum + (typeof p === 'object' ? p.price * item.quantity : 0);
    }, 0);
  });

  total = computed(() => (this.cart()?.products.length ? this.subtotal() + this.deliveryFee : 0));

  ngOnInit() {
    this.loading.set(true);
    this.cartService.loadCart().subscribe({
      next: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  imageUrl(image?: string) {
    return this.productService.imageUrl(image);
  }

  productOf(item: any): Product {
    return item.product as Product;
  }

  updateQuantity(item: any, delta: number) {
    const c = this.cart();
    if (!c) return;
    const product = this.productOf(item);
    const newQty = item.quantity + delta;
    if (newQty < 1 || newQty > product.stock) return;

    const updatedProducts = c.products.map((p) =>
      p === item ? { ...p, quantity: newQty } : p
    );
    const newTotal = updatedProducts.reduce((sum, it) => {
      const prod = it.product as Product;
      return sum + prod.price * it.quantity;
    }, 0);

    this.cartService
      .updateCart(c._id, { products: updatedProducts as any, totalPrice: newTotal })
      .subscribe({ error: () => this.toast.error('Could not update quantity.') });
  }

  removeItem(item: any) {
    const c = this.cart();
    if (!c) return;
    const product = this.productOf(item);
    const updatedProducts = c.products.filter((p) => p !== item);
    const newTotal = updatedProducts.reduce((sum, it) => {
      const prod = it.product as Product;
      return sum + prod.price * it.quantity;
    }, 0);

    this.cartService
      .updateCart(c._id, { products: updatedProducts as any, totalPrice: newTotal })
      .subscribe({
        next: () => this.toast.success(`${product.name} removed from cart.`),
        error: () => this.toast.error('Could not remove item.'),
      });
  }

  goToCheckout() {
    this.router.navigate(['/shop/checkout']);
  }
}
