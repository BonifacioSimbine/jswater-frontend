import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { 
  InvoiceResponse, 
  GenerateInvoiceRequest,
  ClientDebtSummaryResponse,
  MonthlyBillingReportResponse,
  TopDebtorResponse,
  ZoneDebtResponse
} from '../../models/invoice';
import { PageResponse } from '../../models/common/page-response.model';

@Injectable({ providedIn: 'root' })
export class InvoiceApi {

    getBillingDetailReport(options: { month: string; clientId?: string; zone?: string; clientName?: string; page?: number; size?: number }) {
      let params = new HttpParams().set('month', options.month);
      if (options.clientId) params = params.set('clientId', options.clientId);
      if (options.zone) params = params.set('zone', options.zone);
      if (options.clientName) params = params.set('clientName', options.clientName);
      if (options.page != null) params = params.set('page', options.page.toString());
      if (options.size != null) params = params.set('size', options.size.toString());
        return this.http.get<PageResponse<any>>(`${environment.apiUrl}/invoices/reports/billing-detail`, { params });
    }
  private http = inject(HttpClient);
      // apiUrl removido, agora usa environment.apiUrl

  register(body: GenerateInvoiceRequest) {
    return this.http.post<InvoiceResponse>(`${environment.apiUrl}/invoices/register`, body);
  }

  getById(id: string) {
    return this.http.get<InvoiceResponse>(`${environment.apiUrl}/invoices/${id}`);
  }

  /**
   * Lists all invoices (Admin view).
   * Returns a plain list (not paginated in this endpoint version).
   */
  listAll() {
    return this.http.get<InvoiceResponse[]>(`${environment.apiUrl}/invoices`);
  }

  /**
   * Gets a paginated statement for a specific client.
   * ClientId is required by the backend.
   */
  getClientStatement(options: { clientId: string; from?: string; to?: string; page?: number; size?: number }) {
    let params = new HttpParams().set('clientId', options.clientId);
    if (options.from) params = params.set('from', options.from);
    if (options.to) params = params.set('to', options.to);
    if (options.page != null) params = params.set('page', options.page.toString());
    if (options.size != null) params = params.set('size', options.size.toString());
    
    return this.http.get<PageResponse<InvoiceResponse>>(`${environment.apiUrl}/invoices/statement`, { params });
  }

  getClientDebt(clientId: string) {
    const params = new HttpParams().set('clientId', clientId);
    return this.http.get<ClientDebtSummaryResponse>(`${environment.apiUrl}/invoices/debt`, { params });
  }

  getClientPendingInvoices(options: { clientId: string; overdueOnly?: boolean; page?: number; size?: number }) {
    let params = new HttpParams().set('clientId', options.clientId);
    if (options.overdueOnly != null) params = params.set('overdueOnly', String(options.overdueOnly));
    if (options.page != null) params = params.set('page', options.page.toString());
    if (options.size != null) params = params.set('size', options.size.toString());
    return this.http.get<PageResponse<InvoiceResponse>>(`${environment.apiUrl}/invoices/pending`, { params });
  }

  pay(id: string) {
    return this.http.post<InvoiceResponse>(`${environment.apiUrl}/invoices/${id}/pay`, null);
  }

  getMonthlyReport(month: string) {
    const params = new HttpParams().set('month', month);
    return this.http.get<MonthlyBillingReportResponse>(`${environment.apiUrl}/invoices/reports/monthly`, { params });
  }

  getTopDebtors(limit: number = 10) {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<TopDebtorResponse[]>(`${environment.apiUrl}/invoices/reports/top-debtors`, { params });
  }

  getZoneDebt() {
    return this.http.get<ZoneDebtResponse[]>(`${environment.apiUrl}/invoices/reports/zone-debt`);
  }

  getZoneDebtByMonth(month: string) {
    const params = new HttpParams().set('month', month);
    return this.http.get<ZoneDebtResponse[]>(`${environment.apiUrl}/invoices/reports/zone-debt/monthly`, { params });
  }
}
