import { inject, Injectable } from '@angular/core';
import { UserApi } from '../../api/user/user.api';
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
export class UserService {
  private readonly userApi = inject(UserApi);

  login(request: LoginRequest) {
    return this.userApi.login(request);
  }

  register(request: RegisterRequest) {
    return this.userApi.register(request);
  }

  logout(token: string) {
    return this.userApi.logout(token);
  }

  resetPassword(request: ResetPasswordRequestDto) {
    return this.userApi.resetPassword(request);
  }

  listUsers() {
    return this.userApi.listUsers();
  }

  adminResetPassword(request: AdminResetPasswordRequestDto) {
    return this.userApi.adminResetPassword(request);
  }

  changeUserStatus(id: string, status: UserStatus) {
    return this.userApi.changeUserStatus(id, status);
  }
}
