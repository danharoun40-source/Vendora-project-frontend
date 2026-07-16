import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterOutlet],
  templateUrl: './customer-layout.component.html',
})
export class CustomerLayoutComponent implements OnInit {
  auth = inject(AuthService);
  cartService = inject(CartService);
  private router = inject(Router);

  searchTerm = '';
  menuOpen = false;
  accountMenuOpen = false;

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.cartService.loadCart().subscribe({ error: () => {} });
    }
  }

  @HostListener('document:click')
  closeMenus() {
    this.accountMenuOpen = false;
  }

  toggleAccountMenu(event: MouseEvent) {
    event.stopPropagation();
    this.accountMenuOpen = !this.accountMenuOpen;
  }

  onSearch() {
    this.router.navigate(['/shop'], { queryParams: { search: this.searchTerm || null } });
    this.menuOpen = false;
  }

  logout() {
    this.cartService.clearCartLocally();
    this.auth.logout();
  }
}
