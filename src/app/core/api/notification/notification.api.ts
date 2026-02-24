import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PageResponse } from '../../models/common/page-response.model';
import { NotificationResponse } from '../../models/notification';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationApi {
  private http = inject(HttpClient);
  // apiUrl removido, agora usa environment.apiUrl

  list(params?: {
    status?: string;
    category?: string;
    page?: number;
    size?: number;
  }) {
    return this.http.get<PageResponse<NotificationResponse>>(`${environment.apiUrl}/notifications`, {
      params: {
        status: params?.status ?? '',
        category: params?.category ?? '',
        page: params?.page?.toString() ?? '0',
        size: params?.size?.toString() ?? '10',
      },
    });
  }

  getUnreadCount() {
    return this.http.get<number>(`${environment.apiUrl}/notifications/unread-count`);
  }

  markAsRead(id: string) {
    return this.http.post<void>(`${environment.apiUrl}/notifications/${id}/read`, null);
  }

  markAllAsRead() {
    return this.http.post<void>(`${environment.apiUrl}/notifications/read-all`, null);
  }
}
