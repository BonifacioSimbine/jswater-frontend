import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClientApi } from '../../../../core/api/client/client.api';
import { RegisterClientRequest } from '../../../../core/models/client';
import { AuthService } from '../../../../core/services/user/auth.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.css'
})
export class ClientFormComponent {
  private fb = inject(FormBuilder);
  private clientApi = inject(ClientApi);
  private dialogRef = inject(MatDialogRef<ClientFormComponent>);
  private data = inject(MAT_DIALOG_DATA, { optional: true });
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  isEditMode = !!this.data;

  form = this.fb.group({
    fullName: ['', [Validators.required]],
    documentType: ['CPF', [Validators.required]],
    documentNumber: ['', [Validators.required]],
    phoneNumber: ['', [Validators.required]],
    bairro: ['', [Validators.required]],
    localidade: ['', [Validators.required]],
    rua: ['', [Validators.required]],
    numeroCasa: [''],
    referencia: ['']
  });

  isSaving = false;

  constructor() {
    if (this.isEditMode) {
      this.patchForm(this.data);
    }
  }

  patchForm(client: any) {
    this.form.patchValue({
      fullName: client.fullName,
      phoneNumber: client.phoneNumber,
      bairro: client.bairro,
      localidade: client.localidade,
      rua: client.rua,
      referencia: client.referencia,
     
      documentNumber: client.document, 
    });
    
    
    this.form.controls.documentType.disable();
    this.form.controls.documentNumber.disable();
  }

  save() {
    const user = this.authService.getUser();
    if (!user || typeof user.role !== 'string' || user.role.toLowerCase() !== 'admin') {
      this.snackBar.open('Você não tem permissão para realizar esta operação.', 'Fechar', { duration: 4000 });
      return;
    }
    if (this.form.invalid) return;

    this.isSaving = true;
    const formValue = this.form.value;

    let finalRua = formValue.rua || '';
    if (formValue.numeroCasa) {
      finalRua = `${finalRua}, ${formValue.numeroCasa}`;
    }

    if (this.isEditMode) {
      this.update(finalRua, formValue);
    } else {
      this.create(finalRua, formValue);
    }
  }

  create(finalRua: string, formValue: any) {
    const request: RegisterClientRequest = {
      fullName: formValue.fullName || '',
      documentType: formValue.documentType || '',
      documentNumber: formValue.documentNumber || '',
      phoneNumber: formValue.phoneNumber || '',
      bairro: formValue.bairro || '',
      localidade: formValue.localidade || '',
      rua: finalRua,
      referencia: formValue.referencia || '',
      numeroCasa: formValue.numeroCasa || ''
    };

    this.clientApi.register(request).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => this.handleError(err)
    });
  }

  update(finalRua: string, formValue: any) {
    const id = this.data.id;
    
    // 1. Update Basic Info
    const basicUpdate = this.clientApi.update(id, {
      fullName: formValue.fullName,
      phoneNumber: formValue.phoneNumber
    });

    // 2. Update Address
    const addressUpdate = this.clientApi.updateAddress(id, {
      bairro: formValue.bairro,
      localidade: formValue.localidade,
      rua: finalRua,
      referencia: formValue.referencia
    });

    // Run sequentially or parallel. Sequential is safer if dependencies exist, but here they are independent.
    // However, forkJoin is better. 
    // Since I didn't import forkJoin, I'll nest them for simplicity or use a Promise.all approach if I convert to promises.
    // Let's just nest them.
    
    basicUpdate.subscribe({
      next: () => {
        addressUpdate.subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => this.handleError(err)
        });
      },
      error: (err) => this.handleError(err)
    });
  }

  handleError(err: any) {
    console.error(err);
    this.isSaving = false;
    this.snackBar.open('Erro ao salvar cliente', 'Fechar', { duration: 4000 });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
