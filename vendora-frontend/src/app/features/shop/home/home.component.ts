import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models/category.model';
import { Product } from '../../../core/models/product.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    StarRatingComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private toast = inject(ToastService);
  auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  categories: Category[] = [];
  products: Product[] = [];
  loading = true;
  loadingCategories = true;

  searchTerm = '';
  selectedCategory = '';
  sort = '';
  page = 1;
  totalPages = 1;

  ngOnInit() {
    this.loadCategories();

    this.route.queryParamMap.subscribe((params) => {
      this.searchTerm = params.get('search') ?? '';
      this.selectedCategory = params.get('category') ?? '';
      this.page = Number(params.get('page') ?? 1);
      this.loadProducts();
    });

    if (this.auth.isLoggedIn()) {
      this.wishlistService.get().subscribe({ error: () => {} });
    }
  }

  loadCategories() {
    this.loadingCategories = true;
    this.categoryService.getAll().subscribe({
      next: (cats) => {
        this.categories = cats;
        this.loadingCategories = false;
      },
      error: () => (this.loadingCategories = false),
    });
  }

  loadProducts() {
    this.loading = true;
    this.productService
      .getAll({
        search: this.searchTerm || undefined,
        category: this.selectedCategory || undefined,
        sort: this.sort || undefined,
        page: this.page,
        limit: 12,
      })
      .subscribe({
        next: (res) => {
          this.products = res.data;
          this.totalPages = res.totalPages || 1;
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  selectCategory(name: string) {
    this.router.navigate(['/shop'], {
      queryParams: { category: name || null, search: this.searchTerm || null },
    });
  }

  changeSort(value: string) {
    this.sort = value;
    this.loadProducts();
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.router.navigate(['/shop'], {
      queryParams: { page: p, category: this.selectedCategory || null, search: this.searchTerm || null },
      queryParamsHandling: 'merge',
    });
  }

  imageUrl(image?: string) {
    return this.productService.imageUrl(image);
  }

  addToCart(product: Product, event: Event) {
    event.stopPropagation();
    event.preventDefault();

    if (!this.auth.isLoggedIn()) {
      this.toast.info('Please log in to add items to your cart.');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.cartService.addToCart(product._id, 1, product.price).subscribe({
      next: () => this.toast.success(`${product.name} added to cart.`),
    });
  }

  toggleWishlist(product: Product, event: Event) {
    event.stopPropagation();
    event.preventDefault();

    if (!this.auth.isLoggedIn()) {
      this.toast.info('Please log in to use your wishlist.');
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.wishlistService.isWishlisted(product._id)) {
      this.wishlistService.remove(product._id).subscribe();
    } else {
      this.wishlistService.add(product._id).subscribe(() =>
        this.toast.success(`${product.name} added to wishlist.`)
      );
    }
  }

  isWishlisted(id: string) {
    return this.wishlistService.isWishlisted(id);
  }
}
