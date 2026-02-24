import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DashboardResponse } from '../../models/dashboard/dashboard-response.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardApi {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/dashboard';

  getDashboard(month: string, topLimit: number = 10) {
    const params = new HttpParams()
      .set('month', month)
      .set('topLimit', topLimit.toString());
      
    return this.http.get<DashboardResponse>(`${environment.apiUrl}/dashboard`, { params });
  }
}
