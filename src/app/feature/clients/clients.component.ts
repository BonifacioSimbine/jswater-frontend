import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { ClientApi } from '../../core/api/client/client.api';
import { ClientResponse } from '../../core/models/client';
import { ClientStatus } from '../../core/models/client/client-status.model';
import { ClientFormComponent } from './components/client-form/client-form.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { AuthService } from '../../core/services/user/auth.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule,
    MatCardModule, 
    MatTableModule, 
    MatIconModule, 
    MatButtonModule, 
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatMenuModule
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.css',
})
export class ClientsComponent implements OnInit {
  private clientApi = inject(ClientApi);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  searchControl = new FormControl('');
  zoneControl = new FormControl('');
  statusControl = new FormControl<ClientStatus | ''>('');
  
  displayedColumns = ['name', 'document', 'phoneNumber', 'status', 'zone', 'actions'];
  clients: ClientResponse[] = [];
  errorMessage: string | null = null;
  
  // Pagination
  totalElements = 0;
  pageSize = 20;
  pageIndex = 0;

  ngOnInit(): void {
    this.loadClients();
    this.setupSearch();
  }

  setupSearch() {
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(query => {
      this.pageIndex = 0; 
      this.loadClients();
    });

    this.zoneControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(zone => {
      this.pageIndex = 0;
      this.loadClients();
    });

    this.statusControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(status => {
      this.pageIndex = 0;
      this.loadClients();
    });
  }

  loadClients() {
    const searchQuery = this.searchControl.value || undefined;
    const zoneQuery = this.zoneControl.value || undefined;
    const statusQuery = this.statusControl.value || undefined;
    
    this.clientApi
      .list({ page: this.pageIndex, size: this.pageSize, query: searchQuery, zone: zoneQuery, status: statusQuery })
      .subscribe({
        next: (res: any) => {
          let content = [];
          if (res && res.content) {
             content = res.content;
             this.totalElements = res.totalElements;
          } else if (Array.isArray(res)) {
             content = res;
             this.totalElements = res.length;
          }
          
          this.clients = content;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erro ao carregar clientes', err);
          this.errorMessage = 'Não foi possível carregar a lista de clientes.';
          this.cdr.detectChanges();
        },
      });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadClients();
  }

  exportClientsCsv() {
  
    const searchQuery = this.searchControl.value || undefined;
    const zoneQuery = this.zoneControl.value || undefined;
    const statusQuery = this.statusControl.value || undefined;

    this.clientApi.list({ page: 0, size: 1000, query: searchQuery, zone: zoneQuery, status: statusQuery }).subscribe(res => {
      const data = res.content || [];
      if (data.length === 0) {
        this.snackBar.open('Sem dados para exportar.', 'Fechar', { duration: 3000 });
        return;
      }

      const csvContent = [
        ['Nome', 'Documento', 'Telefone', 'Status', 'Zona'], // Header
        ...data.map(c => [c.fullName, c.document, c.phoneNumber, c.status, c.bairro || ''])
      ].map(e => e.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `clientes_${zoneQuery || 'geral'}_${statusQuery || 'todos'}.csv`;
      link.click();
    });
  }

  printReadingSheet() {
      const zoneQuery = this.zoneControl.value || 'Geral';
      const statusQuery = this.statusControl.value || undefined;
      
      // Fetch specifically for the sheet (maybe larger size)
        this.clientApi.list({ 
          page: 0, 
          size: 1000, 
          query: this.searchControl.value || undefined, 
          zone: this.zoneControl.value || undefined,
          status: statusQuery
        }).subscribe(res => {
          const data = res.content || [];
          if (data.length === 0) {
              this.snackBar.open('Nenhum cliente para gerar ficha de leitura.', 'Fechar', { duration: 3000 });
              return;
          }
          this.generateReadingSheetHtml(data, zoneQuery);
      });
  }

  private generateReadingSheetHtml(clients: ClientResponse[], zone: string) {
      const win = window.open('', '_blank');
      if (!win) return;

      const companyName = "JsWater Corp."; 
      const date = new Date().toLocaleDateString();

      const html = `
        <html>
        <head>
          <title>Ficha de Leitura - ${zone}</title>
          <style>
             body { font-family: Arial, sans-serif; padding: 20px; }
             h1 { margin-bottom: 5px; }
             .header { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
             table { width: 100%; border-collapse: collapse; }
             th, td { border: 1px solid #333; padding: 8px; text-align: left; }
             th { background-color: #f0f0f0; }
             .reading-box { width: 100px; display: inline-block; }
          </style>
        </head>
        <body>
           <div class="header">
              <div>
                  <h1>${companyName}</h1>
                  <h3>Ficha de Leitura de Contadores</h3>
              </div>
              <div style="text-align: right;">
                  <p><strong>Zona:</strong> ${zone}</p>
                  <p><strong>Data:</strong> ${date}</p>
              </div>
           </div>

           <table>
            <thead>
                <tr>
                    <th style="width: 5%">#</th>
                    <th style="width: 30%">Cliente</th>
                    <th style="width: 15%">Nº Contador</th>
                    <th style="width: 15%">Bairro</th>
                    <th style="width: 15%">Leitura Anterior</th>
                    <th style="width: 20%">Leitura Atual</th>
                </tr>
            </thead>
            <tbody>
                ${clients.map((c, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${c.fullName}<br><small>${c.document}</small></td>
                    <td>N/A</td> <!-- Meter ID would need to be in ClientResponse -->
                    <td>${c.bairro || '-'}</td>
                    <td></td> <!-- Previous reading if available -->
                    <td></td> <!-- Empty for manual entry -->
                </tr>
                `).join('')}
            </tbody>
           </table>
           <script>window.print();</script>
        </body>
        </html>
      `;

      win.document.write(html);
      win.document.close();
  }

  openNewClientDialog() {
    const user = this.authService.getUser();
    if (!user || (typeof user.role !== 'string') || user.role.toLowerCase() !== 'admin') {
      this.snackBar.open('Você não tem permissão para realizar esta operação.', 'Fechar', { duration: 4000 });
      return;
    }
    const ref = this.dialog.open(ClientFormComponent, {
      width: '600px'
    });

    ref.afterClosed().subscribe(result => {
      if (result === true) {
        this.loadClients();
      }
    });
  }

  editClient(client: ClientResponse) {
    const ref = this.dialog.open(ClientFormComponent, {
      width: '600px',
      data: client
    });

    ref.afterClosed().subscribe(result => {
      if (result === true) {
        this.loadClients();
      }
    });
  }

  toggleStatus(client: ClientResponse) {
    const newStatus = client.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const action = newStatus === 'ACTIVE' ? 'activar' : 'desactivar';
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Confirmar alteração de estado',
        message: `Tem a certeza que deseja ${action} o cliente ${client.fullName}?`,
        confirmLabel: 'Sim, continuar',
        cancelLabel: 'Cancelar'
      }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      this.clientApi.changeStatus(client.id, newStatus).subscribe({
        next: () => {
          this.loadClients();
          this.snackBar.open(`Cliente ${action}o com sucesso.`, 'Fechar', { duration: 3000 });
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open(`Erro ao ${action} cliente.`, 'Fechar', { duration: 4000 });
        }
      });
    });
  }

  deleteClient(client: ClientResponse) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Eliminar cliente',
        message: `Tem a certeza que deseja eliminar o cliente ${client.fullName}? Esta ação não pode ser desfeita.`,
        confirmLabel: 'Eliminar',
        cancelLabel: 'Cancelar'
      }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      this.clientApi.delete(client.id).subscribe({
        next: () => {
          this.loadClients();
          this.snackBar.open('Cliente eliminado com sucesso.', 'Fechar', { duration: 3000 });
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Erro ao eliminar cliente.', 'Fechar', { duration: 4000 });
        }
      });
    });
  }
}
