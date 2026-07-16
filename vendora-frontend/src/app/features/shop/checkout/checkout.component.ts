import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { AddressService } from '../../../core/services/address.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Address } from '../../../core/models/address.model';
import { Product } from '../../../core/models/product.model';
import { PaymentMethod } from '../../../core/models/order.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

const DELIVERY_FEE = 30;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private addressService = inject(AddressService);
  private productService = inject(ProductService);
  private toast = inject(ToastService);
  private router = inject(Router);

  loading = signal(true);
  placingOrder = signal(false);
  addresses = signal<Address[]>([]);
  selectedAddressId = signal<string | null>(null);
  showNewAddressForm = signal(false);

  cart = this.cartService.cart;
  deliveryFee = DELIVERY_FEE;

  subtotal = computed(() => {
    const c = this.cart();
    if (!c) return 0;
    return c.products.reduce((sum, item) => {
      const p = item.product as Product;
      return sum + (typeof p === 'object' ? p.price * item.quantity : 0);
    }, 0);
  });
  total = computed(() => this.subtotal() + this.deliveryFee);

  paymentMethod = signal<PaymentMethod>('Cash');

  addressForm = this.fb.nonNullable.group({
    fullName: ['', Validators.required],
    phone: ['', Validators.required],
    city: ['', Validators.required],
    street: ['', Validators.required],
    building: ['', Validators.required],
    apartment: [''],
  });

  ngOnInit() {
    this.loading.set(true);
    this.cartService.loadCart().subscribe();
    this.addressService.getMine().subscribe({
      next: (res) => {
        this.addresses.set(res.data);
        const def = res.data.find((a) => a.isDefault) ?? res.data[0];
        if (def) this.selectedAddressId.set(def._id);
        else this.showNewAddressForm.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.showNewAddressForm.set(true);
        this.loading.set(false);
      },
    });
  }

  selectAddress(id: string) {
    this.selectedAddressId.set(id);
    this.showNewAddressForm.set(false);
  }

  saveNewAddress() {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }
    this.addressService.add(this.addressForm.getRawValue()).subscribe({
      next: (res) => {
        this.addresses.update((list) => [...list, res.data]);
        this.selectedAddressId.set(res.data._id);
        this.showNewAddressForm.set(false);
        this.toast.success('Address saved.');
      },
    });
  }

  placeOrder() {
    const c = this.cart();
    if (!c || c.products.length === 0) {
      this.toast.error('Your cart is empty.');
      return;
    }
    if (!this.selectedAddressId()) {
      this.toast.error('Please select or add a shipping address.');
      return;
    }

    this.placingOrder.set(true);
    const payload = {
      products: c.products.map((item) => ({
        product: typeof item.product === 'string' ? item.product : (item.product as Product)._id,
        quantity: item.quantity,
      })),
      paymentMethod: this.paymentMethod(),
    };

    this.orderService.create(payload).subscribe({
      next: (res) => {
        this.placingOrder.set(false);
        this.cartService.deleteCart(c._id).subscribe({
          next: () => {},
          error: () => {},
        });
        this.toast.success('Order placed successfully!');
        this.router.navigate(['/shop/orders', res.data._id]);
      },
      error: () => this.placingOrder.set(false),
    });
  }
}
