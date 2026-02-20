// Métodos removidos do topo, já estão dentro da classe.
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
// ...existing code...
import { AuthService, AuthUser } from '../../core/services/user/auth.service';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { NgIf, NgFor } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { NotificationApi } from '../../core/api/notification/notification.api';
import { NotificationResponse } from '../../core/models/notification';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatIconModule,
    NgIf,
    NgFor,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent implements OnInit {
  unreadCount = 0;
  notifications: NotificationResponse[] = [];
  isPanelOpen = false;

  authUser: AuthUser | null = null;
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  constructor(private notificationApi: NotificationApi) {}

  ngOnInit(): void {
    this.loadUnreadCount();
    this.loadNotifications();
    this.authUser = this.authService.getUser();
  }

  togglePanel(): void {
    this.isPanelOpen = !this.isPanelOpen;
  }

  get userInitials(): string {
    if (!this.authUser?.name) return 'U';
    return this.authUser.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }



  loadUnreadCount(): void {
    this.notificationApi.getUnreadCount().subscribe((count) => {
      this.unreadCount = count;
    });
  }

  loadNotifications(): void {
    this.notificationApi
      .list({ page: 0, size: 10 })
      .subscribe((page) => {
        this.notifications = page.content;
      });
  }

  markAsRead(notification: NotificationResponse): void {
    if (notification.status === 'READ') {
      return;
    }

    this.notificationApi.markAsRead(notification.id).subscribe(() => {
      notification.status = 'READ';
      if (this.unreadCount > 0) {
        this.unreadCount -= 1;
      }
      this.cdr.detectChanges();
    });
  }

  markAllAsRead(): void {
    if (this.unreadCount === 0) {
      return;
    }

    this.notificationApi.markAllAsRead().subscribe(() => {
      this.notifications = this.notifications.map((n) => ({
        ...n,
        status: 'READ',
      }));
      this.unreadCount = 0;
      this.cdr.detectChanges();
    });
  }
}
