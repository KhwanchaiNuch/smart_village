import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface VisitLog {
  log_id?: number;
  visit_date?: string;
  visitor_name?: string;
  household_id?: number;
  household_name?: string;
  purpose?: string;
  note?: string;
}

@Injectable({ providedIn: 'root' })
export class VisitLogService {
  private base = `${environment.apiBaseUrl}/visit-logs`;
  constructor(private http: HttpClient) {}

  list(params?: any): Observable<VisitLog[]> {
    return this.http.get<VisitLog[]>(this.base, { params });
  }
  create(body: VisitLog): Observable<VisitLog> {
    return this.http.post<VisitLog>(this.base, body);
  }
  update(id: number, body: VisitLog): Observable<VisitLog> {
    return this.http.put<VisitLog>(`${this.base}/${id}`, body);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
