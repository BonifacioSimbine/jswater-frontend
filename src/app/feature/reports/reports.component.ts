import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import * as XLSX from 'xlsx';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { InvoiceApi } from '../../core/api/invoice/invoice.api';
import { BillingDetailResponse } from '../../core/models/invoice';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule, 
    MatIconModule, 
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatTabsModule
  ],
  providers: [DecimalPipe, DatePipe],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css',
})
export class ReportsComponent implements OnInit {
  private invoiceApi = inject(InvoiceApi);
  private decimalPipe = inject(DecimalPipe);

  private cdr = inject(ChangeDetectorRef);

  selectedReportType = 'MONTHLY'; // MONTHLY | TOP_DEBTORS | ZONE_DEBT | BILLING_DETAIL
  selectedMonth: string = new Date().toISOString().slice(0, 7);
  limit = 10;

  filterZone = '';
  filterClientName = '';

  // Data State
  reportTitle = '';
  columns: string[] = [];
  columnLabels: {[key: string]: string} = {};
  data: any[] = [];
  filteredData: any[] = [];
  kpis: any = {}; // Store extra metrics
  
  isLoading = false;

  // Filtro de status para Detalhe de Faturação
  billingStatusFilter: 'ALL' | 'PAID' | 'OPEN' | 'CANCELLED' = 'ALL';
  // Map UI filter to backend status
  private mapStatusFilterToBackend(status: 'ALL' | 'PAID' | 'OPEN' | 'CANCELLED'): string | null {
    if (status === 'ALL') return null;
    if (status === 'PAID') return 'PAID';
    if (status === 'OPEN') return 'PENDING';
    if (status === 'CANCELLED') return 'CANCELLED';
    return null;
  }

  ngOnInit() {
    this.generateReport();
  }

  generateReport() {
    this.isLoading = true;
    this.data = [];

    if (this.selectedReportType === 'MONTHLY') {
      this.generateMonthlyReport();
    } else if (this.selectedReportType === 'TOP_DEBTORS') {
      this.generateTopDebtors();
    } else if (this.selectedReportType === 'ZONE_DEBT') {
      this.generateZoneDebt();
    } else if (this.selectedReportType === 'BILLING_DETAIL') {
      this.generateBillingDetail();
    }
  }

  generateMonthlyReport() {
    // Garantir formato YYYY-MM
    const monthParam = this.selectedMonth?.length === 7 ? this.selectedMonth : new Date(this.selectedMonth).toISOString().slice(0, 7);
    this.reportTitle = `Relatório Mensal de Faturação - ${monthParam}`;
    this.columns = ['category', 'count', 'amount', 'percent'];
    this.columnLabels = { category: 'Categoria', count: 'Qtd.', amount: 'Valor Total', percent: '%' };

    this.invoiceApi.getMonthlyReport(monthParam).subscribe({
      next: (res: any) => {
        // Map fields from backend response
        const totalCount = res.issuedCount ?? 0;
        const totalAmount = res.totalIssued ?? 0;
        const paidCount = res.paidCount ?? 0;
        const paidAmount = res.totalPaid ?? 0;
        const pendingCount = res.openCount ?? 0;
        const pendingAmount = res.totalOpen ?? 0;
        // KPI Calculations
        const efficiencyRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
        const averageTicket = totalCount > 0 ? (totalAmount / totalCount) : 0;
        this.data = [
          { category: 'Emitidas', count: totalCount, amount: totalAmount, percent: 100 },
          { category: 'Pagas/Arrecadado', count: paidCount, amount: paidAmount, percent: efficiencyRate },
          { category: 'Pendentes/A Receber', count: pendingCount, amount: pendingAmount, percent: totalAmount > 0 ? (pendingAmount/totalAmount)*100 : 0 },
        ];
        this.filteredData = this.data;
      
        this.kpis = { efficiencyRate, averageTicket, cancelledCount: '-' }; 
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }

  generateTopDebtors() {
    this.reportTitle = `Top ${this.limit} Maiores Devedores`;
    this.columns = ['rank', 'fullName', 'totalDebt'];
    this.columnLabels = { rank: '#', fullName: 'Cliente', totalDebt: 'Dívida Total (MT)' };

    this.invoiceApi.getTopDebtors(this.limit).subscribe({
      next: (res: any[]) => {
        this.data = res.map((item, index) => ({
          rank: index + 1,
          fullName: item.fullName || 'Cliente Desconhecido',
          totalDebt: item.totalDebt || 0
        }));
        this.filteredData = this.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => this.isLoading = false
    });
  }

  generateZoneDebt() {
    const monthParam = this.selectedMonth?.length === 7 ? this.selectedMonth : new Date(this.selectedMonth).toISOString().slice(0, 7);
    this.reportTitle = `Dívida por Zona - ${monthParam}`;
    this.columns = ['zone', 'totalDebt'];
    this.columnLabels = { zone: 'Zona', totalDebt: 'Dívida Total (MT)' };

    this.invoiceApi.getZoneDebtByMonth(monthParam).subscribe({
      next: (res: any[]) => {
        this.data = res.map(item => ({
          zone: item.zone || 'Sem Zona',
          totalDebt: item.totalDebt || 0
        }));
        this.filteredData = this.data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => this.isLoading = false
    });
  }

  generateBillingDetail() {
    const monthParam = this.selectedMonth?.length === 7 ? this.selectedMonth : new Date(this.selectedMonth).toISOString().slice(0, 7);
    this.reportTitle = `Detalhe de Faturação - ${monthParam}`;
    this.columns = [
      'month',
      'zone',
      'clientName',
      'previousReading',
      'currentReading',
      'consumption',
      'invoiceAmount',
      'outstandingDebt',
      'fee',
      'fine',
      'amountToPay',
      'difference',
    ];
    this.columnLabels = {
      month: 'Mês',
      zone: 'Zona',
      clientName: 'Cliente',
      previousReading: 'Leitura Anterior',
      currentReading: 'Leitura Actual',
      consumption: 'Consumo',
      invoiceAmount: 'Valor Factura',
      outstandingDebt: 'Dívida',
      fee: 'Taxa',
      fine: 'Multa',
      amountToPay: 'Valor a Pagar',
      difference: 'Diferença',
    };

    this.invoiceApi
      .getBillingDetailReport({
        month: monthParam,
        zone: this.filterZone && this.filterZone.trim() !== '' ? this.filterZone : undefined,
        clientName: this.filterClientName && this.filterClientName.trim() !== '' ? this.filterClientName : undefined,
        page: 0,
        size: 200,
      })
      .subscribe({
        next: (res: { content: BillingDetailResponse[] }) => {
          this.data = res.content;
          this.applyBillingStatusFilter();
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erro ao gerar detalhe de faturação:', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  applyBillingStatusFilter() {
    if (this.selectedReportType !== 'BILLING_DETAIL') {
      this.filteredData = this.data;
      return;
    }
    const backendStatus = this.mapStatusFilterToBackend(this.billingStatusFilter);
    if (!backendStatus) {
      this.filteredData = this.data;
    } else {
      this.filteredData = this.data.filter(row => {
        // status do backend: 'PAID', 'PENDING', 'CANCELLED'
        return row.status === backendStatus;
      });
    }
  }

  exportCsv() {
    if (!this.data.length) return;
    // Montar dados para SheetJS
    const sheetData = [
      this.columns.map(col => this.columnLabels[col]),
      ...this.data.map(row => this.columns.map(col => {
        let val = row[col];
        if (typeof val === 'number') val = val.toFixed(2);
        return val;
      }))
    ];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
    XLSX.writeFile(wb, `relatorio_${this.selectedReportType}_${new Date().getTime()}.xlsx`);
  }

  printReport() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rows = this.data.map(row => `
      <tr>
        ${this.columns.map(col => {
            let val = row[col];
            if (col === 'totalDebt' || col === 'amount') val = this.decimalPipe.transform(val, '1.2-2') + ' MT';
            return `<td style="padding: 8px; border: 1px solid #ddd;">${val}</td>`;
        }).join('')}
      </tr>
    `).join('');

    const headers = this.columns.map(col => `<th style="padding: 8px; border: 1px solid #ddd; background: #f5f5f5; text-align: left;">${this.columnLabels[col]}</th>`).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${this.reportTitle}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .footer { margin-top: 30px; text-align: right; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>${this.reportTitle}</h1>
          <table>
            <thead><tr>${headers}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <div class="footer">Gerado em: ${new Date().toLocaleString()}</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
