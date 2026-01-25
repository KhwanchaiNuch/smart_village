import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReportRow {
  label: string;
  value: number;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // ตัวอย่าง endpoint: GET /reports/summary?type=population&from=2026-01-01&to=2026-01-31&keyword=...
  summary(type: string, filters: { from?: string; to?: string; keyword?: string } = {}): Observable<ReportRow[]> {
    let params = new HttpParams().set('type', type);
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    if (filters.keyword) params = params.set('keyword', filters.keyword);
    return this.http.get<ReportRow[]>(`${this.base}/reports/summary`, { params });
  }

  // ดาวน์โหลดไฟล์ (ถ้าทำฝั่ง backend) เช่น /reports/export?type=... -> Excel/PDF
  export(type: string, filters: { from?: string; to?: string; keyword?: string } = {}): Observable<Blob> {
    let params = new HttpParams().set('type', type);
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    if (filters.keyword) params = params.set('keyword', filters.keyword);
    return this.http.get(`${this.base}/reports/export`, { params, responseType: 'blob' });
  }
}
