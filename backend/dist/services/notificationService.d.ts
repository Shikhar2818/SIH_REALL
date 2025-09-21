export declare class NotificationService {
    static createMentalHealthAlert(screeningId: string, severity: string, studentId: string): Promise<void>;
    static createBookingNotification(bookingId: string, counsellorId: string, studentId: string, action: 'booked' | 'cancelled' | 'rescheduled' | 'confirmed' | 'approved' | 'completed' | 'no_show'): Promise<void>;
    static createConcerningPostAlert(postId: string, authorId: string, category: string, mood: string): Promise<void>;
    static createNoShowAlert(bookingId: string, studentId: string, counsellorId: string): Promise<void>;
    static getNotificationStats(): Promise<{
        totalNotifications: number;
        totalUnread: number;
        byType: any[];
    }>;
    static cleanupExpiredNotifications(): Promise<number>;
}
export default NotificationService;
//# sourceMappingURL=notificationService.d.ts.map