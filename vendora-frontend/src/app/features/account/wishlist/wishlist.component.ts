import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/models/product.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    StarRatingComponent,
  ],
  templateUrl: './wishlist.component.html',
})
export class WishlistComponent implements OnInit {
  private wishlistService = inject(WishlistService);
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loading = signal(true);
  products = signal<Product[]>([]);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.wishlistService.get().subscribe({
      next: (res) => {
        this.products.set(res.data?.products ?? []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  imageUrl(image?: string) {
    return this.productService.imageUrl(image);
  }

  remove(product: Product) {
    this.wishlistService.remove(product._id).subscribe({
      next: () => {
        this.products.update((list) => list.filter((p) => p._id !== product._id));
        this.toast.success('Removed from wishlist.');
      },
    });
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product._id, 1, product.price).subscribe({
      next: () => this.toast.success(`${product.name} added to cart.`),
    });
  }
}
