import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  AdminResetPasswordRequestDto,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequestDto,
  UserAdminResponse,
  UserStatus,
} from '../../models/user';

@Injectable({
  providedIn: 'root',
})
export class UserApi {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/auth';

  login(body: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, body);
  }

  register(body: RegisterRequest) {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, body);
  }

  logout(token: string) {
    return this.http.post<void>(`${this.apiUrl}/logout`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  resetPassword(body: ResetPasswordRequestDto) {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, body);
  }

  listUsers() {
    return this.http.get<UserAdminResponse[]>(`${this.apiUrl}/users`);
  }

  adminResetPassword(body: AdminResetPasswordRequestDto) {
    return this.http.post<void>(`${this.apiUrl}/admin/reset-password`, body);
  }

  changeUserStatus(id: string, status: UserStatus) {
    return this.http.post<void>(`${this.apiUrl}/users/${id}/status`, null, {
      params: { status },
    });
  }
}