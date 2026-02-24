import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MeterResponse, RegisterMeterRequest } from '../../models/meter';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MeterApi {
  private http = inject(HttpClient);
  // apiUrl removido, agora usa environment.apiUrl

  register(body: RegisterMeterRequest) {
    return this.http.post<MeterResponse>(`${environment.apiUrl}/meters/register`, body);
  }

  getById(id: string) {
    return this.http.get<MeterResponse>(`${environment.apiUrl}/meters/${id}`);
  }

  list(options: { serial?: string; page?: number; size?: number } = {}) {
    let params = new HttpParams();
    if (options.serial) params = params.set('serial', options.serial);
    if (options.page != null) params = params.set('page', options.page.toString());
    if (options.size != null) params = params.set('size', options.size.toString());
    
    return this.http.get<any>(`${environment.apiUrl}/meters`, { params }); 
  }
}
