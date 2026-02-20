import { UserStatus } from './user-status.model';

export interface UserAdminResponse {
  id: string;
  username: string;
  role: string;
  status: UserStatus;
}
