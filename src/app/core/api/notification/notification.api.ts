import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PageResponse } from '../../models/common/page-response.model';
import { NotificationResponse } from '../../models/notification';

@Injectable({
  providedIn: 'root',
})
export class NotificationApi {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/notifications';

  list(params?: {
    status?: string;
    category?: string;
    page?: number;
    size?: number;
  }) {
    return this.http.get<PageResponse<NotificationResponse>>(this.apiUrl, {
      params: {
        status: params?.status ?? '',
        category: params?.category ?? '',
        page: params?.page?.toString() ?? '0',
        size: params?.size?.toString() ?? '10',
      },
    });
  }

  getUnreadCount() {
    return this.http.get<number>(`${this.apiUrl}/unread-count`);
  }

  markAsRead(id: string) {
    return this.http.post<void>(`${this.apiUrl}/${id}/read`, null);
  }

  markAllAsRead() {
    return this.http.post<void>(`${this.apiUrl}/read-all`, null);
  }
}
