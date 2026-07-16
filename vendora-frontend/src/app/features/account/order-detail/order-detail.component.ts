import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order } from '../../../core/models/order.model';
import { Product } from '../../../core/models/product.model';
import { User } from '../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private toast = inject(ToastService);

  loading = signal(true);
  order = signal<Order | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(id);
  }

  load(id: string) {
    this.loading.set(true);
    this.orderService.getById(id).subscribe({
      next: (res) => {
        this.order.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  product(item: any): Product {
    return item.product as Product;
  }

  imageUrl(image?: string) {
    return this.productService.imageUrl(image);
  }

  shortId(id: string) {
    return '#ORD-' + id.slice(-6).toUpperCase();
  }

  statusColor(status: string) {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-700';
      case 'Processing':
        return 'bg-blue-100 text-blue-700';
      case 'Shipped':
        return 'bg-indigo-100 text-indigo-700';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-700';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  get subtotal() {
    const o = this.order();
    if (!o) return 0;
    return o.products.reduce((sum, item) => sum + this.product(item).price * item.quantity, 0);
  }

  get deliveryFee() {
    const o = this.order();
    if (!o) return 0;
    return Math.max(o.totalPrice - this.subtotal, 0);
  }

  cancelOrder() {
    const o = this.order();
    if (!o) return;
    if (!confirm('Are you sure you want to cancel this order?')) return;

    this.orderService.cancel(o._id).subscribe({
      next: (res) => {
        this.order.set(res.data);
        this.toast.success('Order cancelled.');
      },
    });
  }
}
