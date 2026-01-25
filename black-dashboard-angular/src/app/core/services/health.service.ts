import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface HealthVisit {
  visit_id?: number;
  person_id?: number;
  person_name?: string;
  visit_date?: string;
  bp?: string;
  weight?: number;
  height?: number;
  chronic_disease?: string;
  note?: string;
  is_bedridden?: boolean;
}

@Injectable({ providedIn: 'root' })
export class HealthService {
  private baseUrl = `${environment.apiBaseUrl}/health-visits`;

  constructor(private http: HttpClient) {}

  list(): Observable<HealthVisit[]> {
    return this.http.get<HealthVisit[]>(this.baseUrl);
  }

  create(body: HealthVisit): Observable<HealthVisit> {
    return this.http.post<HealthVisit>(this.baseUrl, body);
  }

  update(id: number, body: HealthVisit): Observable<HealthVisit> {
    return this.http.put<HealthVisit>(`${this.baseUrl}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
