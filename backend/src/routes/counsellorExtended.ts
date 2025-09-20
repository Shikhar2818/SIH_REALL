import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireCounsellor, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Booking from '../models/Booking';
import Screening from '../models/Screening';
import CounsellorSchedule from '../models/CounsellorSchedule';
import SessionRating from '../models/SessionRating';
import Notification from '../models/Notification';
import NotificationService from '../services/notificationService';

const router = express.Router();

// Get counsellor's assigned students and pending cases
router.get('/my-students', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const counsellorId = req.user!.id;

    // Get all students who have booked with this counsellor
    const students = await Booking.aggregate([
      { $match: { counsellorId: counsellorId } },
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $group: {
          _id: '$studentId',
          student: { $first: '$student' },
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          pendingSessions: {
            $sum: { $cond: [{ $in: ['$status', ['pending', 'confirmed']] }, 1, 0] }
          },
          lastSession: { $max: '$slotStart' },
          nextSession: {
            $min: {
              $cond: [
                { $in: ['$status', ['pending', 'confirmed']] },
                '$slotStart',
                null
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          student: {
            _id: 1,
            name: 1,
            email: 1,
            rollNumber: 1,
            collegeId: 1
          },
          totalSessions: 1,
          completedSessions: 1,
          pendingSessions: 1,
          lastSession: 1,
          nextSession: 1
        }
      },
      { $sort: { 'student.name': 1 } }
    ]);

    res.json({ students });
  } catch (error) {
    console.error('Get counsellor students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get counsellor's upcoming sessions with filtering
router.get('/upcoming-sessions', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const counsellorId = req.user!.id;
    const { status, startDate, endDate, studentId, page = 1, limit = 20 } = req.query;

    const filter: any = {
      counsellorId,
      slotStart: { $gte: new Date() }
    };

    if (status && status !== 'all') {
      if (status === 'pending') {
        filter.status = { $in: ['pending', 'confirmed'] };
      } else {
        filter.status = status;
      }
    }

    if (startDate) {
      filter.slotStart.$gte = new Date(startDate as string);
    }

    if (endDate) {
      filter.slotStart.$lte = new Date(endDate as string);
    }

    if (studentId) {
      filter.studentId = studentId;
    }

    const sessions = await Booking.find(filter)
      .populate('studentId', 'name email rollNumber')
      .sort({ slotStart: 1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      sessions,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    console.error('Get upcoming sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get counsellor's calendar availability
router.get('/schedule', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const counsellorId = req.user!.id;

    const schedule = await CounsellorSchedule.find({ counsellorId })
      .sort({ dayOfWeek: 1, startTime: 1 });

    res.json({ schedule });
  } catch (error) {
    console.error('Get counsellor schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update counsellor's availability schedule
router.post('/schedule', [
  authenticateToken,
  requireCounsellor,
  body('schedules').isArray().withMessage('Schedules must be an array'),
  body('schedules.*.dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Invalid day of week'),
  body('schedules.*.startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time format'),
  body('schedules.*.endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time format'),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const counsellorId = req.user!.id;
    const { schedules } = req.body;

    // Delete existing schedule
    await CounsellorSchedule.deleteMany({ counsellorId });

    // Create new schedule
    const scheduleData = schedules.map((schedule: any) => ({
      ...schedule,
      counsellorId,
    }));

    await CounsellorSchedule.insertMany(scheduleData);

    const newSchedule = await CounsellorSchedule.find({ counsellorId })
      .sort({ dayOfWeek: 1, startTime: 1 });

    res.json({
      message: 'Schedule updated successfully',
      schedule: newSchedule,
    });
  } catch (error) {
    console.error('Update counsellor schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get counsellor analytics and statistics
router.get('/analytics', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const counsellorId = req.user!.id;
    const { timeframe = '30' } = req.query;
    const days = parseInt(timeframe as string);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get booking statistics
    const bookingStats = await Booking.aggregate([
      {
        $match: {
          counsellorId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get session ratings
    const ratings = await SessionRating.find({ counsellorId })
      .populate('bookingId', 'slotStart')
      .sort({ createdAt: -1 })
      .limit(100);

    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
      : 0;

    // Get weekly/monthly session counts
    const sessionCounts = await Booking.aggregate([
      {
        $match: {
          counsellorId,
          status: 'completed',
          slotStart: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$slotStart' },
            month: { $month: '$slotStart' },
            week: { $week: '$slotStart' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.week': 1 } }
    ]);

    // Get cancellation and no-show rates
    const cancellationStats = await Booking.aggregate([
      {
        $match: {
          counsellorId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          noShows: {
            $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] }
          }
        }
      }
    ]);

    const totalSessions = cancellationStats[0]?.total || 0;
    const cancelledSessions = cancellationStats[0]?.cancelled || 0;
    const noShowSessions = cancellationStats[0]?.noShows || 0;

    res.json({
      timeframe: days,
      bookingStats,
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: ratings.length,
      sessionCounts,
      cancellationRate: totalSessions > 0 ? Math.round((cancelledSessions / totalSessions) * 100) : 0,
      noShowRate: totalSessions > 0 ? Math.round((noShowSessions / totalSessions) * 100) : 0,
      totalSessions,
      recentRatings: ratings.slice(0, 5),
    });
  } catch (error) {
    console.error('Get counsellor analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reschedule a booking
router.patch('/bookings/:id/reschedule', [
  authenticateToken,
  requireCounsellor,
  body('newSlotStart').isISO8601().withMessage('Invalid new slot start time'),
  body('newSlotEnd').isISO8601().withMessage('Invalid new slot end time'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason too long'),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { newSlotStart, newSlotEnd, reason } = req.body;
    const counsellorId = req.user!.id;

    const booking = await Booking.findOne({
      _id: req.params.id,
      counsellorId,
      status: { $in: ['pending', 'confirmed'] }
    }).populate('studentId', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or cannot be rescheduled' });
    }

    // Update booking
    const oldSlotStart = booking.slotStart;
    const oldSlotEnd = booking.slotEnd;

    booking.slotStart = new Date(newSlotStart);
    booking.slotEnd = new Date(newSlotEnd);
    booking.status = 'rescheduled';
    booking.rescheduleReason = reason;

    await booking.save();

    // Create notification for student
    await Notification.create({
      recipientId: booking.studentId._id,
      senderId: counsellorId,
      type: 'reschedule',
      title: 'Session Rescheduled',
      message: `Your session has been rescheduled from ${oldSlotStart.toLocaleString()} to ${booking.slotStart.toLocaleString()}.${reason ? ` Reason: ${reason}` : ''}`,
      priority: 'high',
      data: {
        bookingId: booking._id,
        oldSlotStart,
        oldSlotEnd,
        newSlotStart: booking.slotStart,
        newSlotEnd: booking.slotEnd,
        reason,
      },
    });

    res.json({
      message: 'Booking rescheduled successfully',
      booking,
    });
  } catch (error) {
    console.error('Reschedule booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark session as completed with notes
router.patch('/bookings/:id/complete', [
  authenticateToken,
  requireCounsellor,
  body('sessionSummary').optional().trim().isLength({ max: 1000 }).withMessage('Session summary too long'),
  body('counsellorNotes').optional().trim().isLength({ max: 1000 }).withMessage('Counsellor notes too long'),
  body('actualStartTime').optional().isISO8601().withMessage('Invalid actual start time'),
  body('actualEndTime').optional().isISO8601().withMessage('Invalid actual end time'),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionSummary, counsellorNotes, actualStartTime, actualEndTime } = req.body;
    const counsellorId = req.user!.id;

    const booking = await Booking.findOne({
      _id: req.params.id,
      counsellorId,
      status: { $in: ['pending', 'confirmed'] }
    }).populate('studentId', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or cannot be completed' });
    }

    // Update booking
    booking.status = 'completed';
    booking.sessionSummary = sessionSummary;
    booking.counsellorNotes = counsellorNotes;
    booking.actualStartTime = actualStartTime ? new Date(actualStartTime) : undefined;
    booking.actualEndTime = actualEndTime ? new Date(actualEndTime) : undefined;

    await booking.save();

    // Create notification for student
    await Notification.create({
      recipientId: booking.studentId._id,
      senderId: counsellorId,
      type: 'session_reminder',
      title: 'Session Completed',
      message: `Your session has been completed. ${sessionSummary ? 'Summary: ' + sessionSummary : ''}`,
      priority: 'medium',
      data: {
        bookingId: booking._id,
        sessionSummary,
      },
    });

    res.json({
      message: 'Session marked as completed',
      booking,
    });
  } catch (error) {
    console.error('Complete session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark student as no-show
router.patch('/bookings/:id/no-show', [
  authenticateToken,
  requireCounsellor,
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason too long'),
], async (req: AuthRequest, res) => {
  try {
    const { reason } = req.body;
    const counsellorId = req.user!.id;

    const booking = await Booking.findOne({
      _id: req.params.id,
      counsellorId,
      status: { $in: ['pending', 'confirmed'] }
    }).populate('studentId', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or cannot be marked as no-show' });
    }

    // Update booking
    booking.status = 'no_show';
    booking.isNoShow = true;
    booking.counsellorNotes = reason;

    await booking.save();

    // Create notification for student
    await Notification.create({
      recipientId: booking.studentId._id,
      senderId: counsellorId,
      type: 'system',
      title: 'Missed Session',
      message: `You missed your scheduled session. Please contact your counsellor to reschedule.${reason ? ` Note: ${reason}` : ''}`,
      priority: 'high',
      data: {
        bookingId: booking._id,
        reason,
      },
    });

    res.json({
      message: 'Session marked as no-show',
      booking,
    });
  } catch (error) {
    console.error('Mark no-show error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get counsellor notifications
router.get('/notifications', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const counsellorId = req.user!.id;
    const { unreadOnly = false, page = 1, limit = 20 } = req.query;

    const filter: any = { recipientId: counsellorId };

    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .populate('senderId', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ 
      recipientId: counsellorId, 
      isRead: false 
    });

    res.json({
      notifications,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total,
      unreadCount,
    });
  } catch (error) {
    console.error('Get counsellor notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
router.patch('/notifications/:id/read', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const counsellorId = req.user!.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: counsellorId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all bookings for counsellor with detailed student information
router.get('/all-bookings', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const counsellorId = req.user!.id;
    const { status, studentId, startDate, endDate, page = 1, limit = 20 } = req.query;

    const filter: any = { counsellorId };

    // Filter by status
    if (status && status !== 'all') {
      if (status === 'pending') {
        filter.status = { $in: ['pending', 'confirmed'] };
      } else {
        filter.status = status;
      }
    }

    // Filter by student
    if (studentId) {
      filter.studentId = studentId;
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.slotStart = {};
      if (startDate) {
        filter.slotStart.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.slotStart.$lte = new Date(endDate as string);
      }
    }

    const bookings = await Booking.find(filter)
      .populate('studentId', 'name email rollNumber collegeId')
      .sort({ slotStart: 1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Booking.countDocuments(filter);

    // Get booking statistics for this counsellor
    const stats = await Booking.aggregate([
      { $match: { counsellorId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      bookings,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total,
      stats,
    });
  } catch (error) {
    console.error('Get counsellor all bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending bookings that need counsellor approval
router.get('/pending-bookings', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const counsellorId = req.user!.id;

    const pendingBookings = await Booking.find({
      counsellorId,
      status: 'pending'
    })
      .populate('studentId', 'name email rollNumber collegeId')
      .sort({ slotStart: 1 });

    res.json({
      pendingBookings,
      count: pendingBookings.length,
    });
  } catch (error) {
    console.error('Get pending bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve a booking
router.patch('/bookings/:id/approve', [
  authenticateToken,
  requireCounsellor,
  body('counsellorNotes').optional().trim().isLength({ max: 500 }).withMessage('Notes too long'),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { counsellorNotes } = req.body;
    const counsellorId = req.user!.id;

    const booking = await Booking.findOne({
      _id: req.params.id,
      counsellorId,
      status: 'pending'
    }).populate('studentId', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or not pending' });
    }

    // Update booking status
    booking.status = 'confirmed';
    booking.counsellorNotes = counsellorNotes;
    await booking.save();

    // Create notification for student
    await NotificationService.createBookingNotification(
      booking._id.toString(),
      counsellorId,
      booking.studentId._id.toString(),
      'confirmed'
    );

    // Create detailed notification
    await Notification.create({
      recipientId: booking.studentId._id,
      senderId: counsellorId,
      type: 'booking',
      title: 'Booking Approved',
      message: `Your session has been approved by your counsellor for ${booking.slotStart.toLocaleString()}.`,
      priority: 'medium',
      data: {
        bookingId: booking._id,
        counsellorNotes,
        slotStart: booking.slotStart,
        slotEnd: booking.slotEnd,
      },
    });

    const updatedBooking = await Booking.findById(booking._id)
      .populate('studentId', 'name email rollNumber collegeId')
      .populate('counsellorId', 'name email');

    res.json({
      message: 'Booking approved successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject a booking
router.patch('/bookings/:id/reject', [
  authenticateToken,
  requireCounsellor,
  body('reason').trim().isLength({ min: 5, max: 500 }).withMessage('Reason must be 5-500 characters'),
  body('counsellorNotes').optional().trim().isLength({ max: 500 }).withMessage('Notes too long'),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reason, counsellorNotes } = req.body;
    const counsellorId = req.user!.id;

    const booking = await Booking.findOne({
      _id: req.params.id,
      counsellorId,
      status: 'pending'
    }).populate('studentId', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or not pending' });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    booking.counsellorNotes = counsellorNotes;
    await booking.save();

    // Create notification for student
    await NotificationService.createBookingNotification(
      booking._id.toString(),
      counsellorId,
      booking.studentId._id.toString(),
      'cancelled'
    );

    // Create detailed notification
    await Notification.create({
      recipientId: booking.studentId._id,
      senderId: counsellorId,
      type: 'cancellation',
      title: 'Booking Rejected',
      message: `Your session request was not approved. Reason: ${reason}`,
      priority: 'high',
      data: {
        bookingId: booking._id,
        reason,
        counsellorNotes,
        slotStart: booking.slotStart,
        slotEnd: booking.slotEnd,
      },
    });

    const updatedBooking = await Booking.findById(booking._id)
      .populate('studentId', 'name email rollNumber collegeId')
      .populate('counsellorId', 'name email');

    res.json({
      message: 'Booking rejected successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get booking details for counsellor
router.get('/bookings/:id', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const counsellorId = req.user!.id;

    const booking = await Booking.findOne({
      _id: req.params.id,
      counsellorId
    })
      .populate('studentId', 'name email rollNumber collegeId')
      .populate('counsellorId', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Get student's screening history if available
    const studentScreenings = await Screening.find({ userId: booking.studentId._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      booking,
      studentScreenings,
    });
  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get counsellor dashboard summary
router.get('/dashboard-summary', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const counsellorId = req.user!.id;

    // Get today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBookings = await Booking.find({
      counsellorId,
      slotStart: { $gte: today, $lt: tomorrow }
    })
      .populate('studentId', 'name email')
      .sort({ slotStart: 1 });

    // Get pending bookings count
    const pendingCount = await Booking.countDocuments({
      counsellorId,
      status: 'pending'
    });

    // Get upcoming bookings (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingBookings = await Booking.find({
      counsellorId,
      status: { $in: ['pending', 'confirmed'] },
      slotStart: { $gte: new Date(), $lte: nextWeek }
    })
      .populate('studentId', 'name email')
      .sort({ slotStart: 1 })
      .limit(10);

    // Get recent completed sessions
    const recentSessions = await Booking.find({
      counsellorId,
      status: 'completed'
    })
      .populate('studentId', 'name email')
      .sort({ slotStart: -1 })
      .limit(5);

    // Get total students assigned
    const totalStudents = await Booking.distinct('studentId', { counsellorId });

    res.json({
      todayBookings,
      pendingCount,
      upcomingBookings,
      recentSessions,
      totalStudents: totalStudents.length,
      summary: {
        todaySessions: todayBookings.length,
        pendingApprovals: pendingCount,
        upcomingSessions: upcomingBookings.length,
        totalStudents: totalStudents.length,
      }
    });
  } catch (error) {
    console.error('Get counsellor dashboard summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
