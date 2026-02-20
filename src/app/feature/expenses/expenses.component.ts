import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExpensesApiService } from '../../core/api/expenses/expenses.api';
import { ExpenseFormComponent } from './expense-form.component';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    CurrencyPipe,
    DatePipe
  ]
})
export class ExpensesComponent implements OnInit {
  expenses: any[] = [];
  page = 0;
  size = 10;
  totalPages = 1;
  totalElements = 0;
  loading = false;

  constructor(
    private api: ExpensesApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadExpenses();
  }

  loadExpenses() {
    this.loading = true;
    this.api.getExpenses({ page: this.page, size: this.size }).subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.expenses = data;
          this.totalPages = 1;
          this.totalElements = data.length;
        } else if (data && Array.isArray((data as any).content)) {
          this.expenses = (data as any).content;
          this.totalPages = (data as any).totalPages || 1;
          this.totalElements = (data as any).totalElements || this.expenses.length;
        } else {
          this.expenses = [];
          this.totalPages = 1;
          this.totalElements = 0;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erro ao carregar despesas', 'Fechar', { duration: 3000 });
      }
    });
  }

  nextPage() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadExpenses();
    }
  }

  prevPage() {
    if (this.page > 0) {
      this.page--;
      this.loadExpenses();
    }
  }

  openNewExpenseDialog() {
    const dialogRef = this.dialog.open(ExpenseFormComponent, {
      width: '400px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.api.registerExpense(result).subscribe({
          next: () => {
            this.snackBar.open('Despesa registrada com sucesso', 'Fechar', { duration: 3000 });
            this.loadExpenses();
          },
          error: () => this.snackBar.open('Erro ao registrar despesa', 'Fechar', { duration: 3000 })
        });
      }
    });
  }
}
