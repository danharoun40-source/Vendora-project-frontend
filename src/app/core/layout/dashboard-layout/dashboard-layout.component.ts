import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent {
  auth = inject(AuthService);
  sidebarOpen = false;

  navItems = computed<NavItem[]>(() => {
    if (this.auth.role() === 'admin') {
      return [
        { label: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
        { label: 'Products', icon: '🧺', path: '/admin/products' },
        { label: 'Categories', icon: '🗂️', path: '/admin/categories' },
        { label: 'Orders', icon: '📦', path: '/admin/orders' },
      ];
    }
    return [{ label: 'My Products', icon: '🧺', path: '/seller/products' }];
  });

  logout() {
    this.auth.logout();
  }
}
