import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReadingApi } from '../../core/api/reading/reading.api';
import { MeterApi } from '../../core/api/meter/meter.api';
import { InvoiceApi } from '../../core/api/invoice/invoice.api';
import { InvoicePreviewComponent } from '../invoices/components/invoice-preview.component'; // Reuse the dialog
import { ConfirmDialogComponent } from '../clients/components/confirm-dialog/confirm-dialog.component';
import { debounceTime, distinctUntilChanged, switchMap, forkJoin, map, of, catchError } from 'rxjs';

@Component({
  selector: 'app-readings',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatCardModule, 
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './readings.component.html',
  styleUrl: './readings.component.css',
})
export class ReadingsComponent implements OnInit {
    // Atribuir multa a uma leitura
    async assignFine(reading: any) {
      const { AssignFineDialogComponent } = await import('./assign-fine-dialog.component');
      const dialogRef = this.dialog.open(AssignFineDialogComponent, {
        width: '350px',
        data: { reading }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Aqui você pode chamar a API para registrar a multa
          this.snackBar.open('Multa atribuída: ' + result.amount + ' MT para o período ' + result.period, 'Fechar', { duration: 3500 });
        }
      });
    }
  private fb = inject(FormBuilder);
  private readingApi = inject(ReadingApi);
  private meterApi = inject(MeterApi);
  private invoiceApi = inject(InvoiceApi);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  meters: any[] = [];
  meterSearchControl = new FormControl('');

  // Table
  readings: any[] = [];
  displayedColumns = ['date', 'meter', 'clientName', 'value', 'actions'];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;

  nameSearchControl = new FormControl('');
  filteredReadings: any[] = [];

  formPanelOpen = false;

  form = this.fb.group({
    meterId: ['', Validators.required],
    value: [0, [Validators.required, Validators.min(0)]]
  });

  successMessage: string | null = null;
  errorMessage: string | null = null;

  // State for immediate payment
  generatedInvoice: any = null;

  // ngOnInit duplicado removido abaixo, manter apenas o mais completo

  loadReadings() {
    this.readingApi.list({ page: this.pageIndex, size: this.pageSize }).subscribe({
      next: (res: any) => {
        const content = res.content || res || [];
        this.readings = content;
        this.totalElements = res.totalElements || content.length;
        
        // Hydrate Meter Serials and Client Names (Frontend workaround)
        if (this.readings.length > 0) {
          const meterRequests = this.readings.map((r: any) => 
            this.meterApi.getById(r.meterId).pipe(
              map(m => ({ id: r.id, serial: m.meterNumber, clientName: m.clientName })),
              catchError(() => of({ id: r.id, serial: '---', clientName: '---' }))
            )
          );

          forkJoin(meterRequests).subscribe((details: any[]) => {
            this.readings.forEach(r => {
              const detail = details.find(d => d.id === r.id);
              if (detail) {
                r.meterSerialNumber = detail.serial;
                r.clientName = detail.clientName;
              }
            });
            this.applyNameFilter();
            this.cdr.detectChanges();
          });
        } else {
          this.applyNameFilter();
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao ler leituras', err)
    });
  }

  ngOnInit() {
    this.setupMeterSearch();
    this.loadReadings();
    this.nameSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.applyNameFilter());
  }

  applyNameFilter() {
    const filter = (this.nameSearchControl.value || '').toLowerCase();
    if (!filter) {
      this.filteredReadings = [...this.readings];
    } else {
      this.filteredReadings = this.readings.filter(r => (r.clientName || '').toLowerCase().includes(filter));
    }
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadReadings();
  }

  setupMeterSearch() {
    this.meterSearchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || typeof query !== 'string') return [];
        return this.meterApi.list({ serial: query, size: 10 });
      })
    ).subscribe({
      next: (res: any) => {
        // Fix NG0100 by wrapping in setTimeout
        setTimeout(() => {
          this.meters = Array.isArray(res) ? res : (res.content || []);
        });
      },
      error: (err) => console.error(err)
    });
  }

  selectMeter(meter: any) {
    this.form.patchValue({ meterId: meter.id });
  }

  deleteReading(reading: any) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Apagar leitura',
        message: 'Tem certeza que deseja apagar esta leitura? Esta ação não pode ser desfeita.',
        confirmLabel: 'Apagar',
        cancelLabel: 'Cancelar'
      }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      this.readingApi.delete(reading.id).subscribe({
        next: () => {
          setTimeout(() => {
            this.loadReadings();
            this.snackBar.open('Leitura apagada com sucesso!', 'Fechar', { duration: 3000 });
          });
        },
        error: (err) => {
          console.error('Erro ao apagar leitura', err);
          setTimeout(() => {
            this.snackBar.open('Não foi possível apagar a leitura. Tente novamente.', 'Fechar', { duration: 4000 });
          });
        }
      });
    });
  }

  displayFn(meter: any): string {
    return meter ? `${meter.meterNumber} - ${meter.clientName || 'Cliente'}` : '';
  }

  register() {
    if (this.form.invalid) return;
    this.successMessage = null;
    this.errorMessage = null;

    const req = {
      meterId: this.form.value.meterId!,
      currentReading: this.form.value.value!
    };

    this.readingApi.register(req).pipe(
      // Chain invoice generation
      switchMap((res: any) => {
        const val = res.readingValue !== undefined ? res.readingValue : req.currentReading;
        const cons = (res as any).consumption;
        const readingId = res.id;

        // Auto-generate invoice
        return this.invoiceApi.register({ readingId }).pipe(
            map((inv) => ({ success: true, readingId, val, cons, invoiceGenerated: true, invoice: inv })),
            catchError((err) => {
                console.error('Invoice generation failed explicitly', err);
                return of({ success: true, readingId, val, cons, invoiceGenerated: false, invoice: null, invoiceError: err });
            })
        );
      })
    ).subscribe({
      next: (result: any) => {
        setTimeout(() => {
          if (result.invoiceGenerated) {
               this.successMessage = `Leitura registada! Consumo: ${result.cons} m³.`;
               this.generatedInvoice = result.invoice;
          } else {
               const errorMsg = result.invoiceError?.error?.message || 'Erro desconhecido ao gerar fatura.';
               this.successMessage = `Leitura salva. Consumo: ${result.cons} m³.`;
               this.errorMessage = `Atenção: A fatura não foi gerada. Motivo: ${errorMsg}`;
          }
          
          this.form.reset({ meterId: '', value: 0 });
          this.meterSearchControl.setValue('');
          this.loadReadings();
          
          if (!result.invoiceGenerated) {
              setTimeout(() => this.successMessage = null, 5000);
          }
        });
      },
      error: (err) => {
        console.error(err);
        setTimeout(() => {
           this.errorMessage = err.error?.message || 'Erro ao registar leitura.';
        });
      }
    });
  }

  openInvoice() {
    if (this.generatedInvoice) {
      const dialogRef = this.dialog.open(InvoicePreviewComponent, {
        data: this.generatedInvoice,
        width: '800px'
      });
      
      // Clear state after interaction
      dialogRef.afterClosed().subscribe(() => {
        this.generatedInvoice = null; 
        this.successMessage = null;
      });
    }
  }
}
