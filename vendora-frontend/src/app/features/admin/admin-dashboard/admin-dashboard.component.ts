import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardStats } from '../../../core/services/dashboard.service';
import { OrderService } from '../../../core/services/order.service';
import { ProductService } from '../../../core/services/product.service';
import { Order } from '../../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private orderService = inject(OrderService);
  private productService = inject(ProductService);

  loading = signal(true);
  stats = signal<DashboardStats | null>(null);
  recentOrders = signal<Order[]>([]);

  ngOnInit() {
    this.loading.set(true);
    this.dashboardService.getStats().subscribe({
      next: (res) => {
        this.stats.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.orderService.getAll().subscribe({
      next: (res) => {
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.recentOrders.set(sorted.slice(0, 5));
      },
    });
  }

  shortId(id: string) {
    return '#ORD-' + id.slice(-6).toUpperCase();
  }

  customerName(order: Order) {
    const u = order.user;
    if (typeof u === 'string') return 'Customer';
    return `${u.firstName} ${u.lastName}`;
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
