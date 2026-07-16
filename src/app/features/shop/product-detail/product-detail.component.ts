import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ReviewService } from '../../../core/services/review.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/models/product.model';
import { Review } from '../../../core/models/review.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LoadingSpinnerComponent,
    StarRatingComponent,
    EmptyStateComponent,
  ],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private reviewService = inject(ReviewService);
  private cartService = inject(CartService);
  private wishlistService = inject(WishlistService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  auth = inject(AuthService);

  product: Product | null = null;
  reviews: Review[] = [];
  loading = true;
  loadingReviews = true;
  quantity = 1;
  addingToCart = false;

  reviewForm = this.fb.nonNullable.group({
    rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.required, Validators.minLength(3)]],
  });
  submittingReview = false;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(id);
        this.loadReviews(id);
      }
    });

    if (this.auth.isLoggedIn()) {
      this.wishlistService.get().subscribe({ error: () => {} });
    }
  }

  loadProduct(id: string) {
    this.loading = true;
    this.productService.getById(id).subscribe({
      next: (res) => {
        this.product = res.data.product;
        this.quantity = 1;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  loadReviews(id: string) {
    this.loadingReviews = true;
    this.reviewService.getForProduct(id).subscribe({
      next: (res) => {
        this.reviews = res.data;
        this.loadingReviews = false;
      },
      error: () => (this.loadingReviews = false),
    });
  }

  imageUrl(image?: string) {
    return this.productService.imageUrl(image);
  }

  incrementQty() {
    if (this.product && this.quantity < this.product.stock) this.quantity++;
  }

  decrementQty() {
    if (this.quantity > 1) this.quantity--;
  }

  addToCart(buyNow = false) {
    if (!this.auth.isLoggedIn()) {
      this.toast.info('Please log in to continue.');
      this.router.navigate(['/auth/login']);
      return;
    }
    if (!this.product) return;

    this.addingToCart = true;
    this.cartService.addToCart(this.product._id, this.quantity, this.product.price).subscribe({
      next: () => {
        this.addingToCart = false;
        this.toast.success(`${this.product!.name} added to cart.`);
        if (buyNow) {
          this.router.navigate(['/shop/cart']);
        }
      },
      error: () => (this.addingToCart = false),
    });
  }

  toggleWishlist() {
    if (!this.auth.isLoggedIn()) {
      this.toast.info('Please log in to use your wishlist.');
      this.router.navigate(['/auth/login']);
      return;
    }
    if (!this.product) return;

    if (this.wishlistService.isWishlisted(this.product._id)) {
      this.wishlistService.remove(this.product._id).subscribe();
    } else {
      this.wishlistService.add(this.product._id).subscribe(() => this.toast.success('Added to wishlist.'));
    }
  }

  isWishlisted() {
    return this.product ? this.wishlistService.isWishlisted(this.product._id) : false;
  }

  submitReview() {
    if (!this.auth.isLoggedIn()) {
      this.toast.info('Please log in to write a review.');
      this.router.navigate(['/auth/login']);
      return;
    }
    if (this.reviewForm.invalid || !this.product) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    this.submittingReview = true;
    const { rating, comment } = this.reviewForm.getRawValue();
    this.reviewService.add({ product: this.product._id, rating, comment }).subscribe({
      next: () => {
        this.submittingReview = false;
        this.toast.success('Review submitted. Thank you!');
        this.reviewForm.reset({ rating: 5, comment: '' });
        this.loadReviews(this.product!._id);
      },
      error: () => (this.submittingReview = false),
    });
  }

  reviewerName(review: Review) {
    if (typeof review.user === 'string') return 'Vendora Customer';
    return `${review.user.firstName} ${review.user.lastName}`;
  }
}
