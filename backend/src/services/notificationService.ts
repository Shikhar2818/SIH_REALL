import Notification from '../models/Notification';
import User from '../models/User';
import Screening from '../models/Screening';
import ForumPost from '../models/ForumPost';

export class NotificationService {
  // Create mental health alert for severe cases
  static async createMentalHealthAlert(screeningId: string, severity: string, studentId: string) {
    try {
      // Get all admins
      const admins = await User.find({ role: 'admin', isActive: true });
      
      const alertMessages = {
        'moderately_severe': 'Student showing moderately severe mental health symptoms',
        'severe': 'URGENT: Student showing severe mental health symptoms - immediate attention required'
      };

      const priority = severity === 'severe' ? 'urgent' : 'high';

      // Create notifications for all admins
      const notifications = admins.map(admin => ({
        recipientId: admin._id,
        type: 'mental_health_alert' as const,
        title: 'Mental Health Alert',
        message: alertMessages[severity as keyof typeof alertMessages],
        priority,
        data: {
          screeningId,
          severity,
          studentId,
          timestamp: new Date(),
        },
      }));

      await Notification.insertMany(notifications);
      console.log(`Created ${notifications.length} mental health alerts for severity: ${severity}`);
    } catch (error) {
      console.error('Error creating mental health alert:', error);
    }
  }

  // Create booking notification for counsellor or student
  static async createBookingNotification(bookingId: string, counsellorId: string, studentId: string, action: 'booked' | 'cancelled' | 'rescheduled' | 'confirmed' | 'approved' | 'completed' | 'no_show') {
    try {
      const [student, counsellor] = await Promise.all([
        User.findById(studentId).select('name email'),
        User.findById(counsellorId).select('name email')
      ]);

      if (!student || !counsellor) return;

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
        'booked': 'booking' as const,
        'cancelled': 'cancellation' as const,
        'rescheduled': 'reschedule' as const,
        'confirmed': 'booking' as const,
        'approved': 'booking' as const,
        'completed': 'booking' as const,
        'no_show': 'cancellation' as const,
      };

      // Create notification for counsellor when student books/cancels/reschedules
      if (['booked', 'cancelled', 'rescheduled'].includes(action)) {
        await Notification.create({
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

      // Create notification for student when counsellor confirms/approves/completes/marks no-show
      if (['confirmed', 'approved', 'completed', 'no_show'].includes(action)) {
        await Notification.create({
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
    } catch (error) {
      console.error('Error creating booking notification:', error);
    }
  }

  // Create concerning post alert for admins
  static async createConcerningPostAlert(postId: string, authorId: string, category: string, mood: string) {
    try {
      // Get all admins
      const admins = await User.find({ role: 'admin', isActive: true });
      
      const author = await User.findById(authorId).select('name email');
      if (!author) return;

      const concerningCombinations = [
        { category: 'depression', mood: 'sad' },
        { category: 'anxiety', mood: 'anxious' },
        { category: 'stress', mood: 'stressed' },
        { category: 'depression', mood: 'overwhelmed' },
        { category: 'anxiety', mood: 'overwhelmed' },
      ];

      const isConcerning = concerningCombinations.some(
        combo => combo.category === category && combo.mood === mood
      );

      if (isConcerning) {
        const notifications = admins.map(admin => ({
          recipientId: admin._id,
          type: 'mental_health_alert' as const,
          title: 'Concerning Post Alert',
          message: `Student ${author.name} posted concerning content in ${category} category with ${mood} mood`,
          priority: 'high' as const,
          data: {
            postId,
            authorId,
            category,
            mood,
            timestamp: new Date(),
          },
        }));

        await Notification.insertMany(notifications);
        console.log(`Created ${notifications.length} concerning post alerts`);
      }
    } catch (error) {
      console.error('Error creating concerning post alert:', error);
    }
  }

  // Create no-show alert for admins
  static async createNoShowAlert(bookingId: string, studentId: string, counsellorId: string) {
    try {
      // Get all admins
      const admins = await User.find({ role: 'admin', isActive: true });
      
      const [student, counsellor] = await Promise.all([
        User.findById(studentId).select('name email'),
        User.findById(counsellorId).select('name email')
      ]);

      if (!student || !counsellor) return;

      const notifications = admins.map(admin => ({
        recipientId: admin._id,
        type: 'mental_health_alert' as const,
        title: 'No-Show Alert',
        message: `Student ${student.name} missed their session with ${counsellor.name} - potential concern`,
        priority: 'high' as const,
        data: {
          bookingId,
          studentId,
          counsellorId,
          timestamp: new Date(),
        },
      }));

      await Notification.insertMany(notifications);
      console.log(`Created ${notifications.length} no-show alerts`);
    } catch (error) {
      console.error('Error creating no-show alert:', error);
    }
  }

  // Get notification statistics
  static async getNotificationStats() {
    try {
      const stats = await Notification.aggregate([
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

      const totalNotifications = await Notification.countDocuments();
      const totalUnread = await Notification.countDocuments({ isRead: false });

      return {
        totalNotifications,
        totalUnread,
        byType: stats,
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return null;
    }
  }

  // Clean up expired notifications
  static async cleanupExpiredNotifications() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      
      console.log(`Cleaned up ${result.deletedCount} expired notifications`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      return 0;
    }
  }
}

export default NotificationService;
