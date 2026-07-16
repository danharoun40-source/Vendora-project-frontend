import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

type FilterTab = 'All' | OrderStatus;

@Component({
  selector: 'app-manage-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './manage-orders.component.html',
})
export class ManageOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private toast = inject(ToastService);

  loading = signal(true);
  orders = signal<Order[]>([]);
  activeTab = signal<FilterTab>('All');
  selectedOrder = signal<Order | null>(null);
  updatingStatus = signal(false);

  tabs: FilterTab[] = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  statusOptions: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

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
    this.orderService.getAll().subscribe({
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

  openOrder(order: Order) {
    this.selectedOrder.set(order);
  }

  closeOrder() {
    this.selectedOrder.set(null);
  }

  updateStatus(order: Order, status: OrderStatus) {
    this.updatingStatus.set(true);
    this.orderService.updateStatus(order._id, status).subscribe({
      next: (res) => {
        this.updatingStatus.set(false);
        this.toast.success('Order status updated.');
        this.orders.update((list) => list.map((o) => (o._id === order._id ? res.data : o)));
        this.selectedOrder.set(res.data);
      },
      error: () => this.updatingStatus.set(false),
    });
  }

  customerName(order: Order) {
    const u = order.user;
    if (typeof u === 'string') return 'Customer';
    return `${u.firstName} ${u.lastName}`;
  }

  customerPhone(order: Order) {
    const u = order.user;
    if (typeof u === 'string') return '';
    return u.phone ?? '';
  }

  productName(item: any) {
    return typeof item.product === 'string' ? 'Product' : item.product.name;
  }

  productImage(item: any) {
    return typeof item.product === 'string' ? undefined : item.product.image;
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
}
