import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-invoice-snackbar',
  template: `
    <div class="snackbar-content">
      <mat-icon class="snackbar-icon" color="warn">lock</mat-icon>
      <div class="snackbar-title">Acesso Restrito</div>
      <div class="snackbar-message">
        Para sua segurança e controle financeiro,<br>
        <b>apenas faturas pagas</b> podem ser baixadas ou impressas.<br>
        <span class="snackbar-tip">Efetue o pagamento para liberar esta opção.</span>
      </div>
    </div>
  `,
  standalone: true,
  imports: [MatIconModule],
  styles: []
})
export class InvoiceSnackbarComponent {}
