import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private baseUrl = `${environment.apiUrl}/carts`;

  private cartSignal = signal<Cart | null>(null);
  cart = computed(() => this.cartSignal());
  itemCount = computed(() => {
    const c = this.cartSignal();
    if (!c) return 0;
    return c.products.reduce((sum, item) => sum + item.quantity, 0);
  });

  constructor(private http: HttpClient) {}

  loadCart(): Observable<any> {
    return this.http.get<any>(this.baseUrl).pipe(
      tap((res) => {
        const carts = res?.data?.carts ?? [];
        this.cartSignal.set(carts.length ? carts[0] : null);
      })
    );
  }

  addToCart(productId: string, quantity: number, price: number): Observable<any> {
    const body = {
      products: [{ product: productId, quantity }],
      totalPrice: price * quantity,
    };
    return this.http.post<any>(this.baseUrl, body).pipe(
      tap((res) => this.cartSignal.set(res?.data?.cart ?? null))
    );
  }

  updateCart(cartId: string, payload: Partial<Cart>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${cartId}`, payload).pipe(
      tap((res) => this.cartSignal.set(res?.data?.cart ?? null))
    );
  }

  clearCartLocally() {
    this.cartSignal.set(null);
  }

  deleteCart(cartId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${cartId}`).pipe(
      tap(() => this.cartSignal.set(null))
    );
  }
}
