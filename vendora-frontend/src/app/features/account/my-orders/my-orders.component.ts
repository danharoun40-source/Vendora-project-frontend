import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

type FilterTab = 'All' | OrderStatus;

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './my-orders.component.html',
})
export class MyOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private toast = inject(ToastService);

  loading = signal(true);
  orders = signal<Order[]>([]);
  activeTab = signal<FilterTab>('All');

  tabs: FilterTab[] = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  filteredOrders = computed(() => {
    const tab = this.activeTab();
    const all = this.orders();
    if (tab === 'All') return all;
    return all.filter((o) => o.status === tab);
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.orderService.getMyOrders().subscribe({
      next: (res) => {
        this.orders.set(
          [...res.data].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  count(tab: FilterTab) {
    if (tab === 'All') return this.orders().length;
    return this.orders().filter((o) => o.status === tab).length;
  }

  statusColor(status: OrderStatus) {
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
    }
  }

  cancelOrder(order: Order, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    if (!confirm(`Cancel order #${order._id.slice(-6).toUpperCase()}?`)) return;

    this.orderService.cancel(order._id).subscribe({
      next: () => {
        this.toast.success('Order cancelled.');
        this.load();
      },
    });
  }

  imageUrl(image?: string) {
    return this.productService.imageUrl(image);
  }

  shortId(id: string) {
    return '#ORD-' + id.slice(-6).toUpperCase();
  }
}
