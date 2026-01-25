import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Household {
  household_id?: number;
  house_no?: string;
  moo?: string;
  village_name?: string;
  // ที่อยู่แบบแยกส่วน (รองรับทั้งรูปแบบ string และ id จาก backend)
  tambon?: string;
  amphur?: string;
  province?: string;
  head_name?: string;
  // จำนวนสมาชิกในครัวเรือน (บาง endpoint อาจส่ง members หรือ members_count)
  members?: number;
  members_count?: number;

  // ฟิลด์แสดงผลจาก backend (computed/joined)
  head_full_name?: string;
  area_path?: string;
  phone?: string;
  province_id?: number;
  district_id?: number;
  subdistrict_id?: number;
  village_id?: number;
  address?: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class HouseholdService {
  private base = `${environment.apiBaseUrl}/households`;

  constructor(private http: HttpClient) {}

  list(params?: any): Observable<Household[]> {
    return this.http.get<Household[]>(this.base, { params });
  }

  get(id: number): Observable<Household> {
    return this.http.get<Household>(`${this.base}/${id}`);
  }

  create(body: Household): Observable<Household> {
    return this.http.post<Household>(this.base, body);
  }

  update(id: number, body: Household): Observable<Household> {
    return this.http.put<Household>(`${this.base}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
