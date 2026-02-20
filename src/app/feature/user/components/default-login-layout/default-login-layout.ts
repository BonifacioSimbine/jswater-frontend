import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-default-login-layout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './default-login-layout.html',
  styleUrl: './default-login-layout.css',
})
export class DefaultLoginLayout {
  @Input() title: string = '';
  @Input() titlelogo: string = '';
  @Input() primaryBtnText: string = '';
  @Input() loginForm!: FormGroup;
  @Input() hidePassword = true;
  @Input() isLoading = false;
  @Input() errorMessage: string | null = null;

  @Output() submitted = new EventEmitter<void>();
  @Output() togglePasswordVisibility = new EventEmitter<void>();
}
