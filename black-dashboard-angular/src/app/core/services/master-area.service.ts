import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Province { province_id?: number; code?: string; name_th: string; }
export interface District { district_id?: number; province_id?: number; code?: string; name_th: string; }
export interface Subdistrict { subdistrict_id?: number; district_id?: number; code?: string; name_th: string; }
export interface Village { village_id?: number; subdistrict_id?: number; moo_no?: string; name_th: string; }

@Injectable({ providedIn: 'root' })
export class MasterAreaService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  // Provinces
  listProvinces(): Observable<Province[]> {
    return this.http.get<Province[]>(`${this.base}/master-areas/provinces`);
  }
  createProvince(body: Partial<Province>): Observable<Province> {
    return this.http.post<Province>(`${this.base}/master-areas/provinces`, body);
  }
  updateProvince(id: number, body: Partial<Province>): Observable<Province> {
    return this.http.put<Province>(`${this.base}/master-areas/provinces/${id}`, body);
  }
  deleteProvince(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/master-areas/provinces/${id}`);
  }

  // Districts
  listDistricts(provinceId?: number): Observable<District[]> {
    const q = provinceId ? `?provinceId=${provinceId}` : '';
    return this.http.get<District[]>(`${this.base}/master-areas/districts${q}`);
  }
  createDistrict(body: Partial<District>): Observable<District> {
    return this.http.post<District>(`${this.base}/master-areas/districts`, body);
  }
  updateDistrict(id: number, body: Partial<District>): Observable<District> {
    return this.http.put<District>(`${this.base}/master-areas/districts/${id}`, body);
  }
  deleteDistrict(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/master-areas/districts/${id}`);
  }

  // Subdistricts
  listSubdistricts(districtId?: number): Observable<Subdistrict[]> {
    const q = districtId ? `?districtId=${districtId}` : '';
    return this.http.get<Subdistrict[]>(`${this.base}/master-areas/subdistricts${q}`);
  }
  createSubdistrict(body: Partial<Subdistrict>): Observable<Subdistrict> {
    return this.http.post<Subdistrict>(`${this.base}/master-areas/subdistricts`, body);
  }
  updateSubdistrict(id: number, body: Partial<Subdistrict>): Observable<Subdistrict> {
    return this.http.put<Subdistrict>(`${this.base}/master-areas/subdistricts/${id}`, body);
  }
  deleteSubdistrict(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/master-areas/subdistricts/${id}`);
  }

  // Villages
  listVillages(subdistrictId?: number): Observable<Village[]> {
    const q = subdistrictId ? `?subdistrictId=${subdistrictId}` : '';
    return this.http.get<Village[]>(`${this.base}/master-areas/villages${q}`);
  }
  createVillage(body: Partial<Village>): Observable<Village> {
    return this.http.post<Village>(`${this.base}/master-areas/villages`, body);
  }
  updateVillage(id: number, body: Partial<Village>): Observable<Village> {
    return this.http.put<Village>(`${this.base}/master-areas/villages/${id}`, body);
  }
  deleteVillage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/master-areas/villages/${id}`);
  }
}
