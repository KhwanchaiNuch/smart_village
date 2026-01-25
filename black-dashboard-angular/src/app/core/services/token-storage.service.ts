import { Injectable } from '@angular/core';

const TOKEN_KEY = 'sv_token';
const USER_KEY = 'sv_user';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  getUser<T = any>(): T | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  setUser(user: any): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user ?? null));
  }

  clearUser(): void {
    localStorage.removeItem(USER_KEY);
  }

  clearAll(): void {
    this.clearToken();
    this.clearUser();
  }

  clear(): void {
    this.clearAll();
  }

  signOut(): void {
    this.clearAll();
  }
}
