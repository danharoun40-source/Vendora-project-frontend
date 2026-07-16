import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '../models/user.model';

const TOKEN_KEY = 'vendora_token';
const USER_KEY = 'vendora_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;

  private currentUserSignal = signal<User | null>(this.readUser());
  currentUser = computed(() => this.currentUserSignal());
  isLoggedIn = computed(() => !!this.currentUserSignal());
  role = computed(() => this.currentUserSignal()?.role ?? null);

  constructor(private http: HttpClient, private router: Router) {}

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, payload);
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap((res) => this.setSession(res))
    );
  }

  setSession(res: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.currentUserSignal.set(res.user);
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private readUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  homeRouteForRole(): string {
    const role = this.role();
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'seller') return '/seller/products';
    return '/shop';
  }
}
