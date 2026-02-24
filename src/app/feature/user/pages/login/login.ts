import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DefaultLoginLayout } from '../../components/default-login-layout/default-login-layout';
import { UserService } from '../../../../core/services/user/user.service';
import { AuthService } from '../../../../core/services/user/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [DefaultLoginLayout, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private authService = inject(AuthService);

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  hidePassword = true;
  isLoading = false;
  errorMessage: string | null = null;

  onSubmitted(): void {
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    const { username, password } = this.loginForm.value;

    this.userService
      .login({ username, password })
      .subscribe({
        next: (res) => {
          console.log('[Login] Login response:', res);
          const name = res.name || (res as any).username;
          this.authService.setUser({ name, role: res.role, token: res.token });
          console.log('[Login] Após setUser, localStorage:', localStorage.getItem('auth_token'));
          this.router.navigate(['/app']);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('[Login] Erro no login', err);
          if (err.status === 401 || err.status === 403) {
            this.errorMessage = 'Credenciais inválidas.';
          } else {
            this.errorMessage = 'Não foi possível autenticar. Tente novamente.';
          }
          this.isLoading = false;
        },
      });
  }

  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }
}
