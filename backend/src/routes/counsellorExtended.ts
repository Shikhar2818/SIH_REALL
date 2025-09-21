import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireCounsellor, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Booking from '../models/Booking';
import Screening from '../models/Screening';
import Counsellor from '../models/Counsellor';
import CounsellorSchedule from '../models/CounsellorSchedule';
import SessionRating from '../models/SessionRating';
import Notification from '../models/Notification';
import NotificationService from '../services/notificationService';

const router = express.Router();

// Helper function to get counsellor user ID (counsellors are stored in User model)
const getCounsellorUserId = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user || user.role !== 'counsellor') return null;
  
  return user._id;
};

// Get all bookings for the counsellor
router.get('/all-bookings', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const counsellorUserId = await getCounsellorUserId(req.user!.id);
    if (!counsellorUserId) {
      return res.status(404).json({ error: 'Counsellor profile not found' });
    }

    const { status, page = 1, limit = 20, search } = req.query;
    
    const filter: any = { counsellorId: counsellorUserId };
    
    if (status && status !== 'all') {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('studentId', 'name email')
      .populate('counsellorId', 'name email')
      .sort({ slotStart: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    // If search term provided, filter by student name or email
    let filteredBookings = bookings;
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredBookings = bookings.filter(booking => {
        const student = booking.studentId as any;
        return student?.name?.toLowerCase().includes(searchTerm) || 
               student?.email?.toLowerCase().includes(searchTerm);
      });
    }

    const total = await Booking.countDocuments(filter);

    res.json({
      bookings: filteredBookings,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get pending bookings that need counsellor approval
router.get('/pending-bookings', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const counsellorUserId = await getCounsellorUserId(req.user!.id);
    if (!counsellorUserId) {
      return res.status(404).json({ error: 'Counsellor profile not found' });
    }

    const pendingBookings = await Booking.find({
      counsellorId: counsellorUserId,
      status: 'pending'
    })
      .populate('studentId', 'name email')
      .populate('counsellorId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ bookings: pendingBookings });
  } catch (error) {
    console.error('Get pending bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch pending bookings' });
  }
});

// Approve a booking
router.patch('/bookings/:id/approve', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const counsellorUserId = await getCounsellorUserId(req.user!.id);
    if (!counsellorUserId) {
      return res.status(404).json({ error: 'Counsellor profile not found' });
    }

    const { notes } = req.body;
    
    const booking = await Booking.findOne({
      _id: req.params.id,
      counsellorId: counsellorUserId,
      status: 'pending'
    }).populate('studentId', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Pending booking not found' });
    }

    // Update booking status
    booking.status = 'confirmed';
    if (notes) {
      booking.counsellorNotes = notes;
    }
    
    await booking.save();

    // Create notification for student
    await NotificationService.createBookingNotification(
      booking._id.toString(),
      counsellorUserId.toString(),
      (booking.studentId as any)._id.toString(),
      'approved'
    );

    res.json({
      message: 'Booking approved successfully',
      booking,
    });
  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json({ error: 'Failed to approve booking' });
  }
});

// Reject a booking
router.patch('/bookings/:id/reject', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const counsellorUserId = await getCounsellorUserId(req.user!.id);
    if (!counsellorUserId) {
      return res.status(404).json({ error: 'Counsellor profile not found' });
    }

    const { reason } = req.body;
    
    const booking = await Booking.findOne({
      _id: req.params.id,
      counsellorId: counsellorUserId,
      status: 'pending'
    }).populate('studentId', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Pending booking not found' });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.cancellationReason = reason || 'Cancelled by counsellor';
    
    await booking.save();

    // Create notification for student
    await NotificationService.createBookingNotification(
      booking._id.toString(),
      counsellorUserId.toString(),
      (booking.studentId as any)._id.toString(),
      'cancelled'
    );

    res.json({
      message: 'Booking rejected successfully',
      booking,
    });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({ error: 'Failed to reject booking' });
  }
});

// Get counsellor dashboard summary
router.get('/dashboard-summary', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const counsellorUserId = await getCounsellorUserId(req.user!.id);
    if (!counsellorUserId) {
      return res.status(404).json({ error: 'Counsellor profile not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's bookings
    const todayBookings = await Booking.find({
      counsellorId: counsellorUserId,
      slotStart: { $gte: today, $lt: tomorrow },
      status: { $in: ['confirmed', 'completed'] }
    }).populate('studentId', 'name email');

    // Get pending bookings count
    const pendingCount = await Booking.countDocuments({
      counsellorId: counsellorUserId,
      status: 'pending'
    });

    // Get upcoming bookings (next 7 days)
    const upcomingBookings = await Booking.find({
      counsellorId: counsellorUserId,
      slotStart: { $gte: tomorrow },
      status: { $in: ['confirmed', 'pending'] }
    }).populate('studentId', 'name email').sort({ slotStart: 1 });

    // Get recent sessions (last 7 days)
    const recentSessions = await Booking.find({
      counsellorId: counsellorUserId,
      status: 'completed',
      slotStart: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).populate('studentId', 'name email').sort({ slotStart: -1 });

    // Get total unique students
    const totalStudents = await Booking.distinct('studentId', {
      counsellorId: counsellorUserId
    });

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
        totalStudents: totalStudents.length
      }
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

// Get booking details
router.get('/bookings/:id', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const counsellorUserId = await getCounsellorUserId(req.user!.id);
    if (!counsellorUserId) {
      return res.status(404).json({ error: 'Counsellor profile not found' });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      counsellorId: counsellorUserId
    })
      .populate('studentId', 'name email rollNumber collegeId')
      .populate('counsellorId', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({ error: 'Failed to fetch booking details' });
  }
});

// Complete a booking
router.patch('/bookings/:id/complete', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const counsellorUserId = await getCounsellorUserId(req.user!.id);
    if (!counsellorUserId) {
      return res.status(404).json({ error: 'Counsellor profile not found' });
    }

    const { sessionSummary } = req.body;
    
    const booking = await Booking.findOne({
      _id: req.params.id,
      counsellorId: counsellorUserId,
      status: 'confirmed'
    }).populate('studentId', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Confirmed booking not found' });
    }

    // Update booking status
    booking.status = 'completed';
    if (sessionSummary) {
      booking.sessionSummary = sessionSummary;
    }
    booking.actualEndTime = new Date();
    
    await booking.save();

    // Create notification for student
    await NotificationService.createBookingNotification(
      booking._id.toString(),
      counsellorUserId.toString(),
      (booking.studentId as any)._id.toString(),
      'completed'
    );

    res.json({
      message: 'Booking completed successfully',
      booking,
    });
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({ error: 'Failed to complete booking' });
  }
});

// Mark booking as no-show
router.patch('/bookings/:id/no-show', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const counsellorUserId = await getCounsellorUserId(req.user!.id);
    if (!counsellorUserId) {
      return res.status(404).json({ error: 'Counsellor profile not found' });
    }

    const { reason } = req.body;
    
    const booking = await Booking.findOne({
      _id: req.params.id,
      counsellorId: counsellorUserId,
      status: 'confirmed'
    }).populate('studentId', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Confirmed booking not found' });
    }

    // Update booking status
    booking.status = 'no_show';
    booking.isNoShow = true;
    if (reason) {
      booking.cancellationReason = reason;
    }
    
    await booking.save();

    // Create notification for student
    await NotificationService.createBookingNotification(
      booking._id.toString(),
      counsellorUserId.toString(),
      (booking.studentId as any)._id.toString(),
      'no_show'
    );

    res.json({
      message: 'Booking marked as no-show successfully',
      booking,
    });
  } catch (error) {
    console.error('No-show booking error:', error);
    res.status(500).json({ error: 'Failed to mark booking as no-show' });
  }
});

// Reschedule a booking
router.patch('/bookings/:id/reschedule', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const counsellorUserId = await getCounsellorUserId(req.user!.id);
    if (!counsellorUserId) {
      return res.status(404).json({ error: 'Counsellor profile not found' });
    }

    const { newSlotStart, newSlotEnd, reason } = req.body;
    
    const booking = await Booking.findOne({
      _id: req.params.id,
      counsellorId: counsellorUserId,
      status: { $in: ['confirmed', 'pending'] }
    }).populate('studentId', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Bookable booking not found' });
    }

    // Update booking with new times
    booking.slotStart = new Date(newSlotStart);
    booking.slotEnd = new Date(newSlotEnd);
    booking.status = 'rescheduled';
    if (reason) {
      booking.rescheduleReason = reason;
    }
    
    await booking.save();

    // Create notification for student
    await NotificationService.createBookingNotification(
      booking._id.toString(),
      counsellorUserId.toString(),
      (booking.studentId as any)._id.toString(),
      'rescheduled'
    );

    res.json({
      message: 'Booking rescheduled successfully',
      booking,
    });
  } catch (error) {
    console.error('Reschedule booking error:', error);
    res.status(500).json({ error: 'Failed to reschedule booking' });
  }
});

export default router;
