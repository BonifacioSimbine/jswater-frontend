import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MeterResponse, RegisterMeterRequest } from '../../models/meter';

@Injectable({ providedIn: 'root' })
export class MeterApi {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/meters';

  register(body: RegisterMeterRequest) {
    return this.http.post<MeterResponse>(`${this.apiUrl}/register`, body);
  }

  getById(id: string) {
    return this.http.get<MeterResponse>(`${this.apiUrl}/${id}`);
  }

  list(options: { serial?: string; page?: number; size?: number } = {}) {
    let params = new HttpParams();
    if (options.serial) params = params.set('serial', options.serial);
    if (options.page != null) params = params.set('page', options.page.toString());
    if (options.size != null) params = params.set('size', options.size.toString());
    
    return this.http.get<any>(`${this.apiUrl}`, { params }); 
  }
}
