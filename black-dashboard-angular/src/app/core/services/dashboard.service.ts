import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardSummary {
  households: number;
  persons: number;
  issues_open: number;
  visits_month: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.base}/dashboard/summary`);
  }
}
