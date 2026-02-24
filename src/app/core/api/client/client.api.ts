import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PageResponse } from '../../models/common/page-response.model';
import { ClientResponse, RegisterClientRequest } from '../../models/client';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClientApi {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/clients';

  register(body: RegisterClientRequest) {
    return this.http.post<ClientResponse>(`${environment.apiUrl}/clients/register`, body);
  }

  getById(id: string) {
    return this.http.get<ClientResponse>(`${environment.apiUrl}/clients/${id}`);
  }

  list(options: { status?: string; zone?: string; page?: number; size?: number; query?: string } = {}) {
    let params = new HttpParams();
    if (options.status) params = params.set('status', options.status);
    if (options.zone) params = params.set('zone', options.zone);
    if (options.query) params = params.set('query', options.query);
    if (options.page != null) params = params.set('page', options.page.toString());
    if (options.size != null) params = params.set('size', options.size.toString());

    return this.http.get<PageResponse<ClientResponse>>(`${environment.apiUrl}/clients`, { params });
  }

  updateAddress(id: string, body: any) {
    return this.http.put(`${environment.apiUrl}/clients/${id}/address`, body);
  }

  update(id: string, body: any) {
    return this.http.put<ClientResponse>(`${environment.apiUrl}/clients/${id}`, body);
  }

  delete(id: string) {
    return this.http.delete<void>(`${environment.apiUrl}/clients/${id}`);
  }

  getDebt(id: string) {
    return this.http.get(`${environment.apiUrl}/clients/${id}/debt`);
  }

  changeStatus(id: string, status: string) {
    const params = new HttpParams().set('status', status);
    return this.http.post(`${environment.apiUrl}/clients/${id}/status`, null, { params });
  }
}
