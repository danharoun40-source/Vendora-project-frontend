import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Wishlist } from '../models/wishlist.model';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private baseUrl = `${environment.apiUrl}/wishlist`;

  wishlistIds = signal<Set<string>>(new Set());

  constructor(private http: HttpClient) {}

  get(): Observable<ApiResponse<Wishlist>> {
    return this.http.get<ApiResponse<Wishlist>>(this.baseUrl).pipe(
      tap((res) => {
        const ids = (res?.data?.products ?? []).map((p) => p._id);
        this.wishlistIds.set(new Set(ids));
      })
    );
  }

  add(productId: string): Observable<ApiResponse<Wishlist>> {
    return this.http.post<ApiResponse<Wishlist>>(`${this.baseUrl}/${productId}`, {}).pipe(
      tap(() => this.wishlistIds.update((set) => new Set(set).add(productId)))
    );
  }

  remove(productId: string): Observable<ApiResponse<Wishlist>> {
    return this.http.delete<ApiResponse<Wishlist>>(`${this.baseUrl}/${productId}`).pipe(
      tap(() =>
        this.wishlistIds.update((set) => {
          const next = new Set(set);
          next.delete(productId);
          return next;
        })
      )
    );
  }

  isWishlisted(productId: string): boolean {
    return this.wishlistIds().has(productId);
  }
}
