import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Review } from '../models/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private baseUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  getForProduct(productId: string): Observable<ApiResponse<Review[]>> {
    return this.http.get<ApiResponse<Review[]>>(`${this.baseUrl}/product/${productId}`);
  }

  add(payload: { product: string; rating: number; comment: string }): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(this.baseUrl, payload);
  }

  update(id: string, payload: { rating?: number; comment?: string }): Observable<ApiResponse<Review>> {
    return this.http.put<ApiResponse<Review>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
