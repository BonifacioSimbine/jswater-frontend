  import {
      AdminResetPasswordRequestDto,
      LoginRequest,
      LoginResponse,
      RegisterRequest,
      RegisterResponse,
      ResetPasswordRequestDto,
      UserAdminResponse,
      UserStatus
    } from '../../models/user';
import { environment } from '../../../../environments/environment';
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserApi {
  private http = inject(HttpClient);


  login(body: LoginRequest) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, body);
  }

  register(body: RegisterRequest) {
    return this.http.post<RegisterResponse>(`${environment.apiUrl}/auth/register`, body);
  }

  logout(token: string) {
    return this.http.post<void>(`${environment.apiUrl}/auth/logout`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  resetPassword(body: ResetPasswordRequestDto) {
    return this.http.post<void>(`${environment.apiUrl}/auth/reset-password`, body);
  }

  listUsers() {
    return this.http.get<UserAdminResponse[]>(`${environment.apiUrl}/auth/users`);
  }

  adminResetPassword(body: AdminResetPasswordRequestDto) {
    return this.http.post<void>(`${environment.apiUrl}/auth/admin/reset-password`, body);
  }

  changeUserStatus(id: string, status: UserStatus) {
    return this.http.post<void>(`${environment.apiUrl}/auth/users/${id}/status`, null, {
      params: { status },
    });
  }
}