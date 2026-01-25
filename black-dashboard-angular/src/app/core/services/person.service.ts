import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Person {
  person_id?: number;
  first_name?: string;
  last_name?: string;
  // รองรับทั้งชื่อฟิลด์ cid และ citizen_id จาก backend
  cid?: string;
  citizen_id?: string;
  gender?: string;
  dob?: string;
  phone?: string;
  household_id?: number;
  // บาง endpoint อาจส่งเลขที่บ้านที่ join มาจาก household
  house_no?: string;
  in_house_register?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PersonService {
  private baseUrl = `${environment.apiBaseUrl}/persons`;

  constructor(private http: HttpClient) {}

  list(): Observable<Person[]> {
    return this.http.get<Person[]>(this.baseUrl);
  }

  get(id: number): Observable<Person> {
    return this.http.get<Person>(`${this.baseUrl}/${id}`);
  }

  create(body: Person): Observable<Person> {
    return this.http.post<Person>(this.baseUrl, body);
  }

  update(id: number, body: Person): Observable<Person> {
    return this.http.put<Person>(`${this.baseUrl}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  remove(id: number): Observable<void> {
    return this.delete(id);
  }
}
