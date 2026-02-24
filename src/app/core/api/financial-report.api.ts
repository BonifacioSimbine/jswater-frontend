import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FinancialReportApiService {
  constructor(private http: HttpClient) {}

  getFinancialReport(month: string, zone?: string, clientName?: string): Observable<any> {
    let params: any = { month };
    if (zone) params.zone = zone;
    if (clientName) params.clientName = clientName;
    return this.http.get<any>(`${environment.apiUrl}/invoices/reports/financial`, { params });
  }
}
