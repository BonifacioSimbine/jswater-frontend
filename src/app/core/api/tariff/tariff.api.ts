import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { 
  TariffResponse, 
  RegisterTariffRequest, 
  DeactivateTariffRequest 
} from '../../models/tariff';

@Injectable({ providedIn: 'root' })
export class TariffApi {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/tariffs';

  register(body: RegisterTariffRequest) {
    return this.http.post<TariffResponse>(`${this.apiUrl}/register`, body);
  }

  getActiveForPeriod(period?: string) {
    let params = new HttpParams();
    if (period) params = params.set('period', period);
    return this.http.get<TariffResponse>(`${this.apiUrl}/active`, { params });
  }

  listAll() {
    return this.http.get<TariffResponse[]>(`${this.apiUrl}`);
  }

  deactivate(id: string, body: DeactivateTariffRequest) {
    return this.http.put<TariffResponse>(`${this.apiUrl}/${id}/deactivate`, body);
  }
}
