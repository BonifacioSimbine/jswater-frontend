import { Component, inject, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InvoiceApi } from '../../core/api/invoice/invoice.api';
import { ClientApi } from '../../core/api/client/client.api';
import { InvoiceResponse } from '../../core/models/invoice';
import { ClientResponse } from '../../core/models/client';
import { InvoicePreviewComponent } from './components/invoice-preview.component';
import { ConfirmDialogComponent } from '../clients/components/confirm-dialog/confirm-dialog.component';
import { debounceTime, distinctUntilChanged, switchMap, finalize, timeout } from 'rxjs';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    MatCardModule, 
    MatTableModule, 
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatPaginatorModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.css',
})
export class InvoicesComponent implements OnInit {
  private invoiceApi = inject(InvoiceApi);
  private clientApi = inject(ClientApi);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  searchControl = new FormControl(''); 
  clients: ClientResponse[] = [];
  selectedClient: ClientResponse | null = null;
  
  displayedColumns = ['number', 'client', 'zone', 'period', 'amount', 'dueDate', 'status', 'actions'];
  

  dataSource = new MatTableDataSource<InvoiceResponse>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Filter State
  filterValues: any = {
    search: '',
    status: 'ALL',
    period: '',
    zone: ''
  };

  test: any;
  
  
  invoices: InvoiceResponse[] = [];
  
  
  totalElements = 0;
  pageSize = 10;
  pageIndex = 1;
  
  isLoading = false;
  errorMessage: string | null = null;
  
  today = new Date(); // To check for overdue

  ngOnInit() {
    this.setupClientSearch();
    this.loadAllInvoices();
    
    // Custom Filter Predicate
    this.dataSource.filterPredicate = this.createFilter();
  }

  viewInvoice(invoice: InvoiceResponse) {
    this.dialog.open(InvoicePreviewComponent, {
      data: invoice,
      width: '800px',
      autoFocus: false
    });
  }

  // ... (isOverdue remains valid)
  isOverdue(invoice: InvoiceResponse): boolean {
    if (invoice.status !== 'PENDING') return false;
    const due = new Date(invoice.dueDate);
    const now = new Date();
    return due < now;
  }

  // Filter Logic
  createFilter(): (data: InvoiceResponse, filter: string) => boolean {
    return (data: InvoiceResponse, filter: string): boolean => {
      const searchTerms = JSON.parse(filter);
      
      // 1. Text Search (Client Name, ID)
      const matchesSearch = !searchTerms.search || 
        ((data.clientName?.toLowerCase().includes(searchTerms.search) ?? false) || 
         data.id.toLowerCase().includes(searchTerms.search));

      // 2. Status
      const matchesStatus = searchTerms.status === 'ALL' || 
        (searchTerms.status === 'OVERDUE' ? this.isOverdue(data) : data.status === searchTerms.status);

      // 3. Period
      const matchesPeriod = !searchTerms.period || 
        data.period.includes(searchTerms.period);

      // 4. Zone
      const matchesZone = !searchTerms.zone || ((
         data.bairro?.toLowerCase().includes(searchTerms.zone) || 
         data.zone?.toLowerCase().includes(searchTerms.zone)) ?? false);

      return matchesSearch && matchesStatus && matchesPeriod && matchesZone;
    };
  }

  // Filter Events
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.search = filterValue.trim().toLowerCase();
    this.dataSource.filter = JSON.stringify(this.filterValues);
  }

  applyZoneFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.zone = filterValue.trim().toLowerCase();
    this.dataSource.filter = JSON.stringify(this.filterValues);
  }

  applyStatusFilter(status: string) {
    this.filterValues.status = status;
    this.dataSource.filter = JSON.stringify(this.filterValues);
  }

  applyPeriodFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterValues.period = filterValue.trim();
    this.dataSource.filter = JSON.stringify(this.filterValues);
  }


  setupClientSearch() {
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || typeof query !== 'string') return [];
        return this.clientApi.list({ query: query, size: 5 });
      })
    ).subscribe({
      next: (res) => {
        this.clients = res.content || [];
        // Resolve NG0100: If update happens during check, delay or detect changes
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error(err)
    });
  }

  selectClient(client: ClientResponse) {
    this.selectedClient = client;
    this.pageIndex = 0;
    this.loadClientInvoices(client.id);
  }

  clearSelection() {
    this.selectedClient = null;
    this.searchControl.setValue('');
    this.pageIndex = 0;
    this.loadAllInvoices();
  }

  loadAllInvoices() {
    this.isLoading = true;
    this.errorMessage = null;

    this.invoiceApi.listAll()
      .pipe(
        timeout(15000), // Timeout after 15s to prevent infinite loading
        finalize(() => {
          setTimeout(() => {
            this.isLoading = false; 
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (res) => {
          setTimeout(() => {
            this.invoices = res || [];
            this.dataSource.data = this.invoices;
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.totalElements = this.invoices.length;
          });
        },
        error: (err) => {
          console.warn('Load invoices failed:', err);
          setTimeout(() => {
            this.dataSource.data = [];
            
            if (err.name === 'TimeoutError') {
               this.errorMessage = 'O carregamento demorou demasiado. Tente pesquisar por um cliente específico.';
            } else if (err.status === 403) {
               this.errorMessage = 'Selecione um cliente para visualizar as faturas.';
               // If 403, we might want to clear the spinner silently or show info
            } else {
               this.errorMessage = 'Erro ao carregar lista de faturas.';
            }
          });
        }
      });
  }

  loadClientInvoices(clientId: string) {
    this.isLoading = true;
    
    this.invoiceApi.getClientStatement({ 
      clientId, 
      page: 0, 
      size: 100
    }).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.invoices = res.content || [];
          this.dataSource.data = this.invoices;
          this.dataSource.paginator = this.paginator;
          
          this.totalElements = res.totalElements || 0;
          this.isLoading = false;
        });
      },
      error: (err) => {
        console.error(err);
        setTimeout(() => {
           this.errorMessage = 'Erro ao carregar faturas.';
           this.isLoading = false;
        });
      }
    });
  }

  onPageChange(event: PageEvent) {
    // Only used if we are doing server-side pagination (fallback)
    // If using MatTableDataSource, this is handled automatically.
    // But if we are in "Restricted Mode" (Search Client), we might need this.
    // Let's leave it compatible.
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    if (this.selectedClient) {
      this.loadClientInvoices(this.selectedClient.id);
    }
  }

  displayFn(client: ClientResponse): string {
    return client ? client.fullName : '';
  }

  pay(invoice: InvoiceResponse) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Confirmar pagamento',
        message: `Confirmar pagamento da fatura ${invoice.id}?`,
        confirmLabel: 'Confirmar',
        cancelLabel: 'Cancelar'
      }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      this.invoiceApi.pay(invoice.id).subscribe({
        next: () => {
          this.snackBar.open('Pagamento registado com sucesso!', 'Fechar', { duration: 3000 });
          if (this.selectedClient) {
            this.loadClientInvoices(this.selectedClient.id);
          } else {
            this.loadAllInvoices();
          }
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Erro ao processar pagamento.', 'Fechar', { duration: 4000 });
        }
      });
    });
  }
}
