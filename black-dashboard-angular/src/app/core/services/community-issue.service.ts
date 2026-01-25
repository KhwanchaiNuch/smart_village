import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CommunityIssue {
  issue_id?: number;
  title: string;
  category?: string;
  detail?: string;
  severity?: string;
  status?: string;
  area_name?: string;
  report_date?: string;
  reporter_name?: string;
}

@Injectable({ providedIn: 'root' })
export class CommunityIssueService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  list(): Observable<CommunityIssue[]> {
    return this.http.get<CommunityIssue[]>(`${this.base}/community-issues`);
  }
  create(body: Partial<CommunityIssue>): Observable<CommunityIssue> {
    return this.http.post<CommunityIssue>(`${this.base}/community-issues`, body);
  }
  update(id: number, body: Partial<CommunityIssue>): Observable<CommunityIssue> {
    return this.http.put<CommunityIssue>(`${this.base}/community-issues/${id}`, body);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/community-issues/${id}`);
  }
}
