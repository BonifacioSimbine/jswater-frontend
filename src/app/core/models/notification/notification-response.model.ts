import { NotificationCategory } from './notification-category.model';
import { NotificationStatus } from './notification-status.model';
import { NotificationType } from './notification-type.model';

export interface NotificationResponse {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: NotificationCategory;
  type: NotificationType;
  status: NotificationStatus;
  createdAt: string;
  readAt?: string | null;
  metadata?: string | null;
}
