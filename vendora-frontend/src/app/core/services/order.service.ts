import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { CreateOrderPayload, Order, OrderStatus } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private baseUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  create(payload: CreateOrderPayload): Observable<ApiResponse<Order>> {
    return this.http.post<ApiResponse<Order>>(this.baseUrl, payload);
  }

  getMyOrders(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(`${this.baseUrl}/my-orders`);
  }

  getAll(): Observable<ApiResponse<Order[]>> {
    return this.http.get<ApiResponse<Order[]>>(this.baseUrl);
  }

  getById(id: string): Observable<ApiResponse<Order>> {
    return this.http.get<ApiResponse<Order>>(`${this.baseUrl}/${id}`);
  }

  updateStatus(id: string, status: OrderStatus): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(`${this.baseUrl}/${id}`, { status });
  }

  cancel(id: string): Observable<ApiResponse<Order>> {
    return this.http.put<ApiResponse<Order>>(`${this.baseUrl}/cancel/${id}`, {});
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }
}
