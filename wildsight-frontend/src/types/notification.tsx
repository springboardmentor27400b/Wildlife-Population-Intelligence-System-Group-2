export interface Notification {

    notificationId: number;

    userId: number;

    userName: string;

    title: string;

    message: string;

    notificationType: string;

    isRead: boolean;

    createdAt: string;

    readAt: string | null;

}