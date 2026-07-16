import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Product, ProductListResponse, ProductQueryParams } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private baseUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getAll(params: ProductQueryParams = {}): Observable<ProductListResponse> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<ProductListResponse>(this.baseUrl, { params: httpParams });
  }

  getById(id: string): Observable<ApiResponse<{ product: Product }>> {
    return this.http.get<ApiResponse<{ product: Product }>>(`${this.baseUrl}/${id}`);
  }

  create(formData: FormData): Observable<ApiResponse<{ product: Product }>> {
    return this.http.post<ApiResponse<{ product: Product }>>(this.baseUrl, formData);
  }

  update(id: string, payload: Partial<Product>): Observable<ApiResponse<{ product: Product }>> {
    return this.http.put<ApiResponse<{ product: Product }>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  imageUrl(image?: string): string {
    if (!image) return 'https://placehold.co/400x400/ede9fe/7c3aed?text=Vendora';
    if (image.startsWith('http')) return image;
    return `${environment.apiUrl}/uploads/products/${image}`;
  }
}
