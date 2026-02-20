import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ReadingResponse, RegisterReadingRequest } from '../../models/reading';
import { PageResponse } from '../../models/common/page-response.model';

@Injectable({ providedIn: 'root' })
export class ReadingApi {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/readings';

  register(body: RegisterReadingRequest) {
    return this.http.post<ReadingResponse>(`${this.apiUrl}/register`, body);
  }

  getById(id: string) {
    return this.http.get<ReadingResponse>(`${this.apiUrl}/${id}`);
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  list(options: { meterId?: string; page?: number; size?: number } = {}) {
    let params = new HttpParams();
    if (options.meterId) params = params.set('meterId', options.meterId);
    if (options.page != null) params = params.set('page', options.page.toString());
    if (options.size != null) params = params.set('size', options.size.toString());

    return this.http.get<PageResponse<ReadingResponse>>(`${this.apiUrl}`, { params });
  }
}
