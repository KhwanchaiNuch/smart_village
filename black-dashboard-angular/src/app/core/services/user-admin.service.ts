import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AppUser {
  user_id?: number;
  username: string;
  full_name?: string;
  role_level?: string;
  scope_id?: number;
  is_active?: boolean;
  created_at?: string;
  password?: string; // ใช้ตอน create/ reset เท่านั้น
}

@Injectable({ providedIn: 'root' })
export class UserAdminService {
  private base = `${environment.apiBaseUrl}/users`;

  constructor(private http: HttpClient) {}

  list(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(this.base);
  }

  create(body: AppUser): Observable<AppUser> {
    return this.http.post<AppUser>(this.base, body);
  }

  update(id: number, body: AppUser): Observable<AppUser> {
    return this.http.put<AppUser>(`${this.base}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /** alias for legacy callers */
  remove(id: number): Observable<void> {
    return this.delete(id);
  }
}
