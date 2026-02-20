import { Component, OnInit, inject } from '@angular/core';
import { ExpensesApiService } from '../../core/api/expenses/expenses.api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { DashboardApi } from '../../core/api/dashboard/dashboard.api';
import { DashboardResponse } from '../../core/models/dashboard/dashboard-response.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private dashboardApi = inject(DashboardApi);

  private expensesApi = inject(ExpensesApiService);

  selectedMonth: string = new Date().toISOString().slice(0, 7); 
  data: DashboardResponse | null = null;
  isLoading = false;

  totalExpenses: number = 0;
  netBalance: number = 0;

  displayedColumnsDebtors = ['client', 'debt'];
  displayedColumnsZone = ['zone', 'debt'];

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.isLoading = true;
    // Fetch dashboard data
    this.dashboardApi.getDashboard(this.selectedMonth).subscribe({
      next: (res: any) => {
        this.data = {
          totalActiveClients: res.totalActiveClients ?? res.total_active_clients ?? res.activeClients ?? 0,
          totalMeters: res.totalMeters ?? res.total_meters ?? res.meters ?? 0,
          totalPendingInvoices: res.totalPendingInvoices ?? res.total_pending_invoices ?? res.pendingInvoices ?? 0,
          totalDebt: res.totalDebt ?? res.total_debt ?? res.debt ?? res.totalOpenDebtOverall ?? 0,
          expectedRevenue: res.expectedRevenue ?? res.expected_revenue ?? 0,
          collectedRevenue: res.collectedRevenue ?? res.collected_revenue ?? 0,
          topDebtors: (res.topDebtors || res.top_debtors || []).map((d: any) => ({
            clientId: d.clientId ?? d.client_id ?? d.id,
            clientName: d.clientName ?? d.client_name ?? d.fullName ?? d.name ?? 'Cliente',
            totalDebt: d.totalDebt ?? d.total_debt ?? d.debt ?? 0
          })),
          debtByZone: (res.debtByZone || res.debt_by_zone || res.zoneDebts || []).map((z: any) => ({
            zone: z.zone ?? z.bairro ?? 'Sem Zona',
            totalDebt: z.totalDebt ?? z.total_debt ?? z.debt ?? 0
          }))
        };
        // Fetch expenses for the selected month
        this.fetchExpensesForMonth();
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        this.isLoading = false;
      }
    });
  }

  fetchExpensesForMonth() {
    // Get all expenses (optionally filter by month if API supports it)
    this.expensesApi.getExpenses({ size: 1000 }).subscribe({
      next: (expenses: any) => {
        // If paged, get content
        let list = Array.isArray(expenses) ? expenses : (expenses.content || []);
        // Filter by selectedMonth (yyyy-MM)
        const month = this.selectedMonth;
        const filtered = list.filter((e: any) => (e.date || '').startsWith(month));
        this.totalExpenses = filtered.reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);
        this.updateNetBalance();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading expenses:', err);
        this.totalExpenses = 0;
        this.updateNetBalance();
        this.isLoading = false;
      }
    });
  }

  updateNetBalance() {
    this.netBalance = (this.data?.collectedRevenue || 0) - this.totalExpenses;
  }
}