import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Address } from '../models/address.model';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private baseUrl = `${environment.apiUrl}/addresses`;

  constructor(private http: HttpClient) {}

  getMine(): Observable<ApiResponse<Address[]>> {
    return this.http.get<ApiResponse<Address[]>>(this.baseUrl);
  }

  add(payload: Partial<Address>): Observable<ApiResponse<Address>> {
    return this.http.post<ApiResponse<Address>>(this.baseUrl, payload);
  }

  update(id: string, payload: Partial<Address>): Observable<ApiResponse<Address>> {
    return this.http.put<ApiResponse<Address>>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/${id}`);
  }

  setDefault(id: string): Observable<ApiResponse<Address>> {
    return this.http.put<ApiResponse<Address>>(`${this.baseUrl}/default/${id}`, {});
  }
}
