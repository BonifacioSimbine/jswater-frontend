import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { InvoiceResponse, BillingDetailResponse } from '../../../core/models/invoice';
import { InvoiceApi } from '../../../core/api/invoice/invoice.api';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { ComponentType } from '@angular/cdk/portal';
import { InvoiceSnackbarComponent } from './invoice-snackbar.component';

@Component({
  selector: 'app-invoice-preview',
  standalone: true,
  imports: [
    CommonModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="invoice-container">
      <!-- Print-only header -->
      <div class="print-header">
        <div class="company-logo">
          <mat-icon style="font-size: 48px; height: 48px; width: 48px; color: #1976d2">water_drop</mat-icon>
          <div>
            <h1>JsWater Management</h1>
            <p>Rua Principal, 123 - Maputo</p>
            <p>NUIT: 400123456</p>
          </div>
        </div>
        <div class="invoice-meta">
          <h2>FACTURA/RECIBO</h2>
          <p><strong>Nº:</strong> {{ data.id.split('-')[0] }}</p>
          <p><strong>Data:</strong> {{ data.issueDate | date:'dd/MM/yyyy' }}</p>
        </div>
      </div>

      <mat-dialog-content>
        <!-- On Screen Header (Hidden in Print usually if styled right, but we keep for modal) -->
        <div class="screen-header hide-print">
          <h2>Detalhes da Factura</h2>
          <span class="status-badge" [class.paid]="data.status === 'PAID'" [class.pending]="data.status !== 'PAID'">
            {{ data.status === 'PAID' ? 'PAGO' : 'PENDENTE' }}
          </span>
        </div>

        <div class="client-section">
          <h3>Dados do Cliente</h3>
          <div class="info-row">
            <span><strong>Nome:</strong> {{ data.clientName || 'Cliente Consumidor' }}</span>
            <span><strong>Zona/Bairro:</strong> {{ data.bairro || data.zone || 'N/A' }}</span>
          </div>
          <div class="info-row">
            <span><strong>Código:</strong> {{ data.clientId.split('-')[0] }}</span>
            <span><strong>Período:</strong> {{ data.period }}</span>
          </div>
        </div>

        <mat-divider></mat-divider>

        <div class="details-section">
          <h3>Consumo e Taxas</h3>
          <table class="invoice-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th class="text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              <ng-container *ngIf="billingDetail; else fallbackRow">
                <tr>
                  <td>Leitura Anterior</td>
                  <td class="text-right">{{ billingDetail.previousReading }}</td>
                </tr>
                <tr>
                  <td>Leitura Atual</td>
                  <td class="text-right">{{ billingDetail.currentReading }}</td>
                </tr>
                <tr>
                  <td>Consumo (m³)</td>
                  <td class="text-right">{{ billingDetail.consumption }}</td>
                </tr>
               
                <tr>
                  <td>Multa</td>
                  <td class="text-right">{{ billingDetail.fine | currency:'MZN':'symbol':'1.2-2' }}</td>
                </tr>
               
                <tr>
                  <td>Valor da Fatura</td>
                  <td class="text-right">{{ billingDetail.invoiceAmount | currency:'MZN':'symbol':'1.2-2' }}</td>
                </tr>
               
                
                <tr>
                  <td>IVA (0%)</td>
                  <td class="text-right">0.00 MT</td>
                </tr>
              </ng-container>
              <ng-template #fallbackRow>
                <tr>
                  <td>Consumo de Água ({{ data.period }})</td>
                  <td class="text-right">{{ data.totalAmount | currency:'MZN':'symbol':'1.2-2' }}</td>
                </tr>
                <tr>
                  <td>IVA (0%)</td>
                  <td class="text-right">0.00 MT</td>
                </tr>
              </ng-template>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td>TOTAL A PAGAR</td>
                <td class="text-right">{{ (billingDetail?.invoiceAmount ?? data.amount) | currency:'MZN':'symbol':'1.2-2' }}</td>
              </tr>
            </tfoot>
          </table>
          <div *ngIf="billingDetail && billingDetail.difference !== 0" style="margin-top: 0.5rem; color: #888; font-size: 0.95em;">
            <strong>Observação:</strong> Diferença de ajuste: {{ billingDetail.difference | currency:'MZN':'symbol':'1.2-2' }}
          </div>
        </div>

        <div *ngIf="!billingDetail && data.status !== 'PAID'" class="alert-info" style="margin: 2rem 0; text-align: center; color: #ef6c00; font-size: 1.1em; background: #fff8e1; border-radius: 8px; padding: 1.5rem 1rem;">
          Detalhes completos da fatura estarão disponíveis após o pagamento.<br>
          Caso já tenha pago, aguarde a atualização do sistema.
        </div>

        <div class="payment-info" *ngIf="data.status !== 'PAID'">
            <p><strong>Data de Vencimento:</strong> {{ data.dueDate | date:'dd/MM/yyyy' }}</p>
            <p class="warning">Por favor, regularize o pagamento antes do vencimento para evitar cortes.</p>
        </div>
        <div class="paid-stamp" *ngIf="data.status === 'PAID'">
            PAGO
        </div>

      </mat-dialog-content>
      
      <mat-dialog-actions align="end" class="hide-print">
        <button mat-button mat-dialog-close>Fechar</button>
        <button mat-flat-button color="primary" (click)="print()">
          <mat-icon>print</mat-icon> Imprimir / Baixar
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .invoice-container {
      padding: 0 16px;
      max-width: 800px;
    }
    
    .print-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
      padding-top: 24px;
      border-bottom: 2px solid #eee;
      padding-bottom: 16px;
    }

    .company-logo {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .company-logo h1 { margin: 0; font-size: 1.2rem; }
    .company-logo p { margin: 2px 0; color: #666; font-size: 0.9rem; }

    .invoice-meta { text-align: right; }
    .invoice-meta h2 { margin: 0 0 8px; color: #444; }

    .screen-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .client-section {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .invoice-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
    }
    .invoice-table th, .invoice-table td {
      padding: 12px;
      border-bottom: 1px solid #eee;
      text-align: left;
    }
    .invoice-table .text-right { text-align: right; }
    .invoice-table .total-row td {
      font-weight: bold;
      font-size: 1.2rem;
      border-top: 2px solid #333;
    }

    .payment-info {
      margin-top: 24px;
      text-align: center;
    }
    .warning { color: #d32f2f; font-weight: 500; }

    .status-badge {
      padding: 4px 12px;
      border-radius: 16px;
      font-weight: bold;
      font-size: 0.8rem;
    }
    .status-badge.paid { background: #e8f5e9; color: #2e7d32; }
    .status-badge.pending { background: #fff3e0; color: #ef6c00; }

    .paid-stamp {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 5rem;
      color: rgba(46, 125, 50, 0.2);
      border: 6px solid rgba(46, 125, 50, 0.2);
      padding: 10px 40px;
      border-radius: 10px;
      font-weight: bold;
      pointer-events: none;
      z-index: 0;
    }

    @media print {
      .hide-print { display: none !important; }
      .invoice-container { padding: 0; }
      mat-dialog-content { overflow: visible !important; }
      .client-section { border: 1px solid #ddd; background: none; }
    }
  `]
})
export class InvoicePreviewComponent implements OnInit {
  billingDetail?: BillingDetailResponse;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: InvoiceResponse,
    private dialogRef: MatDialogRef<any>,
    private invoiceApi: InvoiceApi,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Busca sempre o billingDetail pelo mês e clientId, mesmo que não tenha readingId
    const clientIdNorm = (this.data.clientId || '').trim().toLowerCase();
    const periodNorm = (this.data.period || '').trim();
    this.invoiceApi.getBillingDetailReport({ month: this.data.period, clientId: this.data.clientId })
      .subscribe({
        next: (res: any) => {
          console.log('BillingDetailReport response:', res);
          const found = (res.content || []).find((d: any) => {
            const dClientId = (d.clientId || '').trim().toLowerCase();
            const dPeriod = (d.period || '').trim();
            const match = dClientId === clientIdNorm && dPeriod === periodNorm;
            if (!match) {
              console.log('Não bate:', {dClientId, dPeriod, clientIdNorm, periodNorm});
            }
            return match;
          });
          if (found) {
            console.log('Detalhe encontrado:', found);
            // Mapeia os campos para os nomes esperados pelo template
            this.billingDetail = {
              ...found,
              fee: found.tariffRate,
              fine: found.fineAmount,
              outstandingDebt: found.totalDebt,
              month: found.period
            };
            this.cdr.detectChanges();
          } else {
            console.warn('Nenhum detalhe encontrado para clientId e period:', clientIdNorm, periodNorm);
          }
        },
        error: (err) => {
          console.error('Erro ao buscar BillingDetailReport:', err);
        }
      });
  }

  print() {
    if (this.data.status !== 'PAID') {
      this.snackBar.openFromComponent(InvoiceSnackbarComponent, {
        duration: 7000,
        panelClass: ['centered-snackbar', 'professional-snackbar', 'snackbar-beautiful'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
        politeness: 'assertive',
      });
      return;
    }
    window.print();
  }
}
