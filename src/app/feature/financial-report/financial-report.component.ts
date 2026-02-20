import { Component, OnInit } from '@angular/core';
import { FinancialReportApiService } from '../../core/api/financial-report.api';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-financial-report',
  templateUrl: './financial-report.component.html',
  styleUrls: ['./financial-report.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    // CurrencyPipe removido
    DatePipe
  ]
})
export class FinancialReportComponent implements OnInit {
    exportCsv() {
      if (!this.report) return;
      const data = this.report;
      const headers = [
        'Faturado',
        'Recebido',
        'Em Aberto',
        'Saldo Líquido',
        'Faturas Emitidas',
        'Faturas Pagas',
        'Faturas em Aberto',
        '% Inadimplência'
      ];
      const values = [
        data.totalFaturado ?? '',
        data.totalRecebido ?? '',
        data.totalEmAberto ?? '',
        data.saldoLiquido ?? '',
        data.quantidadeFaturasEmitidas ?? '',
        data.quantidadeFaturasPagas ?? '',
        data.quantidadeFaturasEmAberto ?? '',
        data.inadimplenciaPercentual ?? ''
      ];
      const csv = `${headers.join(',')}` + '\n' + `${values.join(',')}`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-financeiro-${this.form.value.month || ''}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  report: any;
  form: any;
  now = new Date();

  constructor(
    private api: FinancialReportApiService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      month: [this.getCurrentMonth()],
      zone: [''],
      clientName: ['']
    });
    this.loadReport();
    this.form.valueChanges.subscribe(() => this.loadReport());
  }

  loadReport() {
    const { month, zone, clientName } = this.form.value;
    this.api.getFinancialReport(month || '', zone || '', clientName || '').subscribe({
      next: (data) => this.report = data,
      error: () => this.snackBar.open('Erro ao carregar relatório financeiro', 'Fechar', { duration: 3000 })
    });
  }

  getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${('0' + (now.getMonth() + 1)).slice(-2)}`;
  }
}
