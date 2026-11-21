export interface NotificationItem {
  id: string;
  recipientUserId: string;
  type: string;
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  actionUrl?: string | null;
  metadata?: Record<string, unknown> | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  unreadCount: number;
}

export interface NotificationsListResponse {
  items: NotificationItem[];
  pagination: NotificationPagination;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface NotificationPreferences {
  id?: string;
  userId: string;
  bookingInApp: boolean;
  paymentInApp: boolean;
  commissionInApp: boolean;
  assignmentInApp: boolean;
  bookingEmail: boolean;
  paymentEmail: boolean;
  commissionEmail: boolean;
  assignmentEmail: boolean;
}
