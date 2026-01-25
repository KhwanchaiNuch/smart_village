import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenStorageService } from './token-storage.service';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserDto {
  user_id?: number;
  username?: string;
  full_name?: string;
  role_level?: string;
  scope_name?: string;
  scope_id?: number;
}

export interface LoginResponse {
  token: string;
  user?: UserDto;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient, private storage: TokenStorageService) {}

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/auth/login`, req).pipe(
      tap((res) => {
        if (res?.token) this.storage.setToken(res.token);
        if (res?.user) this.storage.setUser(res.user);
      })
    );
  }

  logout(): void {
    this.storage.clear();
  }

  getMe(): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.base}/auth/me`);
  }

  updateProfile(payload: Partial<UserDto>): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.base}/auth/profile`, payload);
  }

  changePassword(current: string, next: string): Observable<void> {
    const payload: ChangePasswordRequest = { currentPassword: current, newPassword: next };
    return this.http.post<void>(`${this.base}/auth/change-password`, payload);
  }
}
