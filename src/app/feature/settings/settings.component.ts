import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../clients/components/confirm-dialog/confirm-dialog.component';
import { TariffApi } from '../../core/api/tariff/tariff.api';
import { UserApi } from '../../core/api/user/user.api';
import { TariffResponse } from '../../core/models/tariff';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatCardModule, 
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatListModule,
    MatTabsModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tariffApi = inject(TariffApi);
  private userApi = inject(UserApi);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // Status Messages
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Tariff Logic
  tariffs: TariffResponse[] = [];
  tariffForm = this.fb.group({
    price: [0, [Validators.required, Validators.min(0.01)]],
    validFrom: ['', Validators.required] // yyyy-MM
  });

  // Security Logic
  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  });

  ngOnInit() {
    this.loadTariffs();
  }

  loadTariffs() {
    this.tariffApi.listAll().subscribe({
      next: (res) => {
        // Defer assignment to avoid NG0100
        setTimeout(() => this.tariffs = res);
      },
      error: (err) => console.error(err)
    });
  }

  createTariff() {
    if (this.tariffForm.invalid) return;

    this.tariffApi.register({
      pricePerCubicMeter: this.tariffForm.value.price!,
      validFrom: this.tariffForm.value.validFrom!
    }).subscribe({
      next: () => {
        this.showSuccess('Tarifa atualizada com sucesso!');
        this.tariffForm.reset();
        this.loadTariffs();
      },
      error: (err) => this.showError('Erro ao atualizar tarifa.')
    });
  }

  deactivate(tariff: TariffResponse) {
    const currentMonth = new Date().toISOString().slice(0, 7); // yyyy-MM

    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Desativar tarifa',
        message: `Tem certeza que deseja desativar esta tarifa? Mês final sugerido: ${currentMonth}.`,
        confirmLabel: 'Desativar',
        cancelLabel: 'Cancelar'
      }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;

      const endPeriod = currentMonth;

      this.tariffApi.deactivate(tariff.id, { endPeriod }).subscribe({
        next: () => {
          this.showSuccess('Tarifa desativada com sucesso!');
          this.loadTariffs();
        },
        error: (err) => {
          console.error(err);
          this.showError('Erro ao desativar tarifa. Verifique se existem leituras associadas.');
        }
      });
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) return;
    
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.showError('A nova senha e a confirmação não coincidem.');
      return;
    }

    this.userApi.resetPassword({
      currentPassword: currentPassword!,
      newPassword: newPassword!
    }).subscribe({
      next: () => {
        this.showSuccess('Senha alterada com sucesso!');
        this.passwordForm.reset();
      },
      error: (err) => {
        console.error(err);
        this.showError('Erro ao alterar senha. Verifique sua senha atual.');
      }
    });
  }

  private showSuccess(msg: string) {
    this.snackBar.open(msg, 'Fechar', { duration: 4000 });
    // Mantém também as mensagens na tela para quem preferir ver ali
    setTimeout(() => {
      this.successMessage = msg;
      this.errorMessage = null;
      setTimeout(() => this.successMessage = null, 4000);
    });
  }

  private showError(msg: string) {
    this.snackBar.open(msg, 'Fechar', { duration: 4000 });
    setTimeout(() => {
      this.errorMessage = msg;
      this.successMessage = null;
      setTimeout(() => this.errorMessage = null, 4000);
    });
  }
}
