import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product } from '../../../core/models/product.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './manage-products.component.html',
})
export class ManageProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private toast = inject(ToastService);

  loading = signal(true);
  products = signal<Product[]>([]);
  search = signal('');

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.productService.getAll({ limit: 100 }).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  get filtered() {
    const term = this.search().toLowerCase().trim();
    if (!term) return this.products();
    return this.products().filter((p) => p.name.toLowerCase().includes(term));
  }

  imageUrl(image?: string) {
    return this.productService.imageUrl(image);
  }

  delete(product: Product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    this.productService.delete(product._id).subscribe({
      next: () => {
        this.toast.success('Product deleted.');
        this.products.update((list) => list.filter((p) => p._id !== product._id));
      },
    });
  }
}
