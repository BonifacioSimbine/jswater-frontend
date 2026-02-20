import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-expense-form',
  templateUrl: './expense-form.component.html',
  styleUrls: ['./expense-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule
  ]
})
export class ExpenseFormComponent {
  form: any;

  categorias = ['Operacional', 'Administrativo', 'Manutenção', 'Outro'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ExpenseFormComponent>
  ) {
    this.form = this.fb.group({
      valor: [null, [Validators.required, Validators.min(0.01)]],
      // data removido, será preenchido automaticamente
      descricao: ['', Validators.required],
      categoria: ['', Validators.required],
      responsavel: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.valid) {
      const now = new Date();
      const { valor, descricao, categoria, responsavel } = this.form.value;
      // Formatar data como yyyy-MM-dd
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const date = `${yyyy}-${mm}-${dd}`;
      const data = {
        amount: valor,
        description: descricao,
        category: categoria,
        responsible: responsavel,
        date
      };
      this.dialogRef.close(data);
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
