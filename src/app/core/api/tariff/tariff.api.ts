import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TariffResponse, RegisterTariffRequest, DeactivateTariffRequest } from '../../models/tariff';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TariffApi {
  private http = inject(HttpClient);
  // apiUrl removido, agora usa environment.apiUrl

  register(body: RegisterTariffRequest) {
    return this.http.post<TariffResponse>(`${environment.apiUrl}/tariffs/register`, body);
  }

  getActiveForPeriod(period?: string) {
    let params = new HttpParams();
    if (period) params = params.set('period', period);
    return this.http.get<TariffResponse>(`${environment.apiUrl}/tariffs/active`, { params });
  }

  listAll() {
    return this.http.get<TariffResponse[]>(`${environment.apiUrl}/tariffs`);
  }

  deactivate(id: string, body: DeactivateTariffRequest) {
    return this.http.put<TariffResponse>(`${environment.apiUrl}/tariffs/${id}/deactivate`, body);
  }
}
