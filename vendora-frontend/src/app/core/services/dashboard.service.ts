import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  users: number;
  products: number;
  categories: number;
  orders: number;
  reviews: number;
  revenue: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private baseUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<{ status: string; data: DashboardStats }> {
    return this.http.get<{ status: string; data: DashboardStats }>(this.baseUrl);
  }
}
