import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PageResponse } from '../../models/common/page-response.model';
import { ClientResponse, RegisterClientRequest } from '../../models/client';

@Injectable({ providedIn: 'root' })
export class ClientApi {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/clients';

  register(body: RegisterClientRequest) {
    return this.http.post<ClientResponse>(`${this.apiUrl}/register`, body);
  }

  getById(id: string) {
    return this.http.get<ClientResponse>(`${this.apiUrl}/${id}`);
  }

  list(options: { status?: string; zone?: string; page?: number; size?: number; query?: string } = {}) {
    let params = new HttpParams();
    if (options.status) params = params.set('status', options.status);
    if (options.zone) params = params.set('zone', options.zone);
    if (options.query) params = params.set('query', options.query);
    if (options.page != null) params = params.set('page', options.page.toString());
    if (options.size != null) params = params.set('size', options.size.toString());

    return this.http.get<PageResponse<ClientResponse>>(`${this.apiUrl}`, { params });
  }

  updateAddress(id: string, body: any) {
    return this.http.put(`${this.apiUrl}/${id}/address`, body);
  }

  update(id: string, body: any) {
    return this.http.put<ClientResponse>(`${this.apiUrl}/${id}`, body);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getDebt(id: string) {
    return this.http.get(`${this.apiUrl}/${id}/debt`);
  }

  changeStatus(id: string, status: string) {
    const params = new HttpParams().set('status', status);
    return this.http.post(`${this.apiUrl}/${id}/status`, null, { params });
  }
}
