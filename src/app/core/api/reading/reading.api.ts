import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ReadingResponse, RegisterReadingRequest } from '../../models/reading';
import { PageResponse } from '../../models/common/page-response.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReadingApi {
  private http = inject(HttpClient);
  // apiUrl removido, agora usa environment.apiUrl

  register(body: RegisterReadingRequest) {
    return this.http.post<ReadingResponse>(`${environment.apiUrl}/readings/register`, body);
  }

  getById(id: string) {
    return this.http.get<ReadingResponse>(`${environment.apiUrl}/readings/${id}`);
  }

  delete(id: string) {
    return this.http.delete<void>(`${environment.apiUrl}/readings/${id}`);
  }

  list(options: { meterId?: string; page?: number; size?: number } = {}) {
    let params = new HttpParams();
    if (options.meterId) params = params.set('meterId', options.meterId);
    if (options.page != null) params = params.set('page', options.page.toString());
    if (options.size != null) params = params.set('size', options.size.toString());

    return this.http.get<PageResponse<ReadingResponse>>(`${environment.apiUrl}/readings`, { params });
  }
}
