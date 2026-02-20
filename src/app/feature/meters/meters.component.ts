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
import { MeterApi } from '../../core/api/meter/meter.api';
import { ClientApi } from '../../core/api/client/client.api';
import { ClientResponse } from '../../core/models/client';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-meters',
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
    MatExpansionModule
  ],
  templateUrl: './meters.component.html',
  styleUrl: './meters.component.css',
})
export class MetersComponent implements OnInit {
  private fb = inject(FormBuilder);
  private meterApi = inject(MeterApi);
  private clientApi = inject(ClientApi);
  private cdr = inject(ChangeDetectorRef);

  clients: ClientResponse[] = [];
  clientSearchControl = new FormControl('');

  // Table
  meters: any[] = [];
  displayedColumns = ['serial', 'client', 'date'];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  
  formPanelOpen = false;

  form = this.fb.group({
    clientId: ['', Validators.required],
    meterNumber: ['', Validators.required]
  });

  successMessage: string | null = null;
  errorMessage: string | null = null;

  ngOnInit() {
    this.setupClientSearch();
    this.loadMeters();
  }

  loadMeters() {
    this.meterApi.list({ page: this.pageIndex, size: this.pageSize }).subscribe({
      next: (res: any) => {
        const content = res.content || (Array.isArray(res) ? res : []);
        this.meters = content;
        this.totalElements = res.totalElements || content.length;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao listar contadores', err);
        if (err.status === 403) {
           this.errorMessage = 'Acesso restrito: Não é possível listar todos os contadores.';
        } else {
           this.errorMessage = 'Erro ao carregar lista de contadores.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadMeters();
  }

  setupClientSearch() {
    this.clientSearchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || typeof query !== 'string') return [];
        return this.clientApi.list({ query: query, size: 10 });
      })
    ).subscribe({
      next: (res) => this.clients = res.content || [],
      error: (err) => console.error(err)
    });
  }

  selectClient(client: ClientResponse) {
    this.form.patchValue({ clientId: client.id });
  }

  displayFn(client: ClientResponse): string {
    return client ? client.fullName : '';
  }

  register() {
    if (this.form.invalid) return;
    this.successMessage = null;
    this.errorMessage = null;

    const req = {
      clientId: this.form.value.clientId!,
      meterNumber: this.form.value.meterNumber!
    };

    this.meterApi.register(req).subscribe({
      next: (res) => {
        this.successMessage = `Contador ${req.meterNumber} registado com sucesso!`;
        this.form.reset();
        this.clientSearchControl.reset();
        // Try to reload, but don't block UI if fails
        this.loadMeters();
        this.formPanelOpen = false;
        setTimeout(() => this.successMessage = null, 4000);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Erro ao registar contador.';
      }
    });
  }
}
