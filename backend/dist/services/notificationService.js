"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
const User_1 = __importDefault(require("../models/User"));
class NotificationService {
    static async createMentalHealthAlert(screeningId, severity, studentId) {
        try {
            const admins = await User_1.default.find({ role: 'admin', isActive: true });
            const alertMessages = {
                'moderately_severe': 'Student showing moderately severe mental health symptoms',
                'severe': 'URGENT: Student showing severe mental health symptoms - immediate attention required'
            };
            const priority = severity === 'severe' ? 'urgent' : 'high';
            const notifications = admins.map(admin => ({
                recipientId: admin._id,
                type: 'mental_health_alert',
                title: 'Mental Health Alert',
                message: alertMessages[severity],
                priority,
                data: {
                    screeningId,
                    severity,
                    studentId,
                    timestamp: new Date(),
                },
            }));
            await Notification_1.default.insertMany(notifications);
            console.log(`Created ${notifications.length} mental health alerts for severity: ${severity}`);
        }
        catch (error) {
            console.error('Error creating mental health alert:', error);
        }
    }
    static async createBookingNotification(bookingId, counsellorId, studentId, action) {
        try {
            const [student, counsellor] = await Promise.all([
                User_1.default.findById(studentId).select('name email'),
                User_1.default.findById(counsellorId).select('name email')
            ]);
            if (!student || !counsellor)
                return;
            const messages = {
                'booked': `New session booked with ${counsellor.name}`,
                'cancelled': `Session cancelled by ${student.name}`,
                'rescheduled': `Session rescheduled by ${student.name}`,
                'confirmed': `Session confirmed by ${counsellor.name}`,
                'approved': `Session approved by ${counsellor.name}`,
                'completed': `Session completed by ${counsellor.name}`,
                'no_show': `Session marked as no-show by ${counsellor.name}`,
            };
            const notificationTypes = {
                'booked': 'booking',
                'cancelled': 'cancellation',
                'rescheduled': 'reschedule',
                'confirmed': 'booking',
                'approved': 'booking',
                'completed': 'booking',
                'no_show': 'cancellation',
            };
            if (['booked', 'cancelled', 'rescheduled'].includes(action)) {
                await Notification_1.default.create({
                    recipientId: counsellorId,
                    senderId: studentId,
                    type: notificationTypes[action],
                    title: 'Session Update',
                    message: messages[action],
                    priority: action === 'cancelled' ? 'high' : 'medium',
                    data: {
                        bookingId,
                        studentId,
                        action,
                        timestamp: new Date(),
                    },
                });
            }
            if (['confirmed', 'approved', 'completed', 'no_show'].includes(action)) {
                await Notification_1.default.create({
                    recipientId: studentId,
                    senderId: counsellorId,
                    type: notificationTypes[action],
                    title: 'Session Update',
                    message: messages[action],
                    priority: 'medium',
                    data: {
                        bookingId,
                        counsellorId,
                        action,
                        timestamp: new Date(),
                    },
                });
            }
        }
        catch (error) {
            console.error('Error creating booking notification:', error);
        }
    }
    static async createConcerningPostAlert(postId, authorId, category, mood) {
        try {
            const admins = await User_1.default.find({ role: 'admin', isActive: true });
            const author = await User_1.default.findById(authorId).select('name email');
            if (!author)
                return;
            const concerningCombinations = [
                { category: 'depression', mood: 'sad' },
                { category: 'anxiety', mood: 'anxious' },
                { category: 'stress', mood: 'stressed' },
                { category: 'depression', mood: 'overwhelmed' },
                { category: 'anxiety', mood: 'overwhelmed' },
            ];
            const isConcerning = concerningCombinations.some(combo => combo.category === category && combo.mood === mood);
            if (isConcerning) {
                const notifications = admins.map(admin => ({
                    recipientId: admin._id,
                    type: 'mental_health_alert',
                    title: 'Concerning Post Alert',
                    message: `Student ${author.name} posted concerning content in ${category} category with ${mood} mood`,
                    priority: 'high',
                    data: {
                        postId,
                        authorId,
                        category,
                        mood,
                        timestamp: new Date(),
                    },
                }));
                await Notification_1.default.insertMany(notifications);
                console.log(`Created ${notifications.length} concerning post alerts`);
            }
        }
        catch (error) {
            console.error('Error creating concerning post alert:', error);
        }
    }
    static async createNoShowAlert(bookingId, studentId, counsellorId) {
        try {
            const admins = await User_1.default.find({ role: 'admin', isActive: true });
            const [student, counsellor] = await Promise.all([
                User_1.default.findById(studentId).select('name email'),
                User_1.default.findById(counsellorId).select('name email')
            ]);
            if (!student || !counsellor)
                return;
            const notifications = admins.map(admin => ({
                recipientId: admin._id,
                type: 'mental_health_alert',
                title: 'No-Show Alert',
                message: `Student ${student.name} missed their session with ${counsellor.name} - potential concern`,
                priority: 'high',
                data: {
                    bookingId,
                    studentId,
                    counsellorId,
                    timestamp: new Date(),
                },
            }));
            await Notification_1.default.insertMany(notifications);
            console.log(`Created ${notifications.length} no-show alerts`);
        }
        catch (error) {
            console.error('Error creating no-show alert:', error);
        }
    }
    static async getNotificationStats() {
        try {
            const stats = await Notification_1.default.aggregate([
                {
                    $group: {
                        _id: '$type',
                        count: { $sum: 1 },
                        unread: {
                            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
                        }
                    }
                },
                {
                    $sort: { count: -1 }
                }
            ]);
            const totalNotifications = await Notification_1.default.countDocuments();
            const totalUnread = await Notification_1.default.countDocuments({ isRead: false });
            return {
                totalNotifications,
                totalUnread,
                byType: stats,
            };
        }
        catch (error) {
            console.error('Error getting notification stats:', error);
            return null;
        }
    }
    static async cleanupExpiredNotifications() {
        try {
            const result = await Notification_1.default.deleteMany({
                expiresAt: { $lt: new Date() }
            });
            console.log(`Cleaned up ${result.deletedCount} expired notifications`);
            return result.deletedCount;
        }
        catch (error) {
            console.error('Error cleaning up expired notifications:', error);
            return 0;
        }
    }
}
exports.NotificationService = NotificationService;
exports.default = NotificationService;
//# sourceMappingURL=notificationService.js.map