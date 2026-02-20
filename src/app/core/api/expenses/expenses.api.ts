import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExpensesApiService {
  constructor(private http: HttpClient) {}

  getExpenses(params?: { page?: number; size?: number }): Observable<any[]> {
    let query = '';
    if (params && (params.page !== undefined || params.size !== undefined)) {
      const q = [];
      if (params.page !== undefined) q.push(`page=${params.page}`);
      if (params.size !== undefined) q.push(`size=${params.size}`);
      query = '?' + q.join('&');
    }
    return this.http.get<any[]>(`/api/expenses${query}`);
  }

  registerExpense(expense: any): Observable<any> {
    return this.http.post<any>('/api/expenses', expense);
  }
}
