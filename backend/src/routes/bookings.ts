import express from 'express';
import { body, validationResult } from 'express-validator';
import Booking from '../models/Booking';
import User from '../models/User';
import Counsellor from '../models/Counsellor';
import { sendBookingNotification } from '../utils/email';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import NotificationService from '../services/notificationService';

const router = express.Router();

// Create booking
router.post('/', [
  authenticateToken,
  body('counsellorId').isMongoId().withMessage('Valid counsellor ID required'),
  body('slotStart').isISO8601().withMessage('Valid start time required'),
  body('slotEnd').isISO8601().withMessage('Valid end time required'),
  body('notes').optional().trim(),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { counsellorId, slotStart, slotEnd, notes } = req.body;

    // Validate slot times
    const startTime = new Date(slotStart);
    const endTime = new Date(slotEnd);

    if (startTime >= endTime) {
      return res.status(400).json({ error: 'Start time must be before end time' });
    }

    if (startTime <= new Date()) {
      return res.status(400).json({ error: 'Booking must be in the future' });
    }

    // Check if counsellor exists and is a counsellor user
    const counsellor = await User.findOne({ 
      _id: counsellorId, 
      role: 'counsellor' 
    });
    if (!counsellor) {
      return res.status(404).json({ error: 'Counsellor not found' });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      counsellorId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          slotStart: { $lt: endTime },
          slotEnd: { $gt: startTime },
        },
      ],
    });

    if (conflictingBooking) {
      return res.status(400).json({ error: 'Time slot is not available' });
    }

    // Create booking
    const booking = new Booking({
      studentId: req.user!.id,
      counsellorId,
      slotStart: startTime,
      slotEnd: endTime,
      notes,
    });

    await booking.save();

    // Create notification for counsellor
    await NotificationService.createBookingNotification(
      booking._id.toString(),
      counsellorId,
      req.user!.id,
      'booked'
    );

    // Send email notification to counsellor
    try {
      await sendBookingNotification(
        counsellor.email,
        req.user!.name,
        startTime,
        endTime
      );
    } catch (emailError) {
      console.error('Failed to send booking notification:', emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        id: booking._id,
        counsellorId: booking.counsellorId,
        slotStart: booking.slotStart,
        slotEnd: booking.slotEnd,
        status: booking.status,
        notes: booking.notes,
        createdAt: booking.createdAt,
      },
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's bookings
router.get('/my-bookings', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const bookings = await Booking.find({ studentId: req.user!.id })
      .populate('counsellorId', 'name email')
      .sort({ slotStart: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update booking status (for counsellors)
router.patch('/:id/status', [
  authenticateToken,
  body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed'])
    .withMessage('Valid status required'),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    res.json({
      message: 'Booking status updated',
      booking: {
        id: booking._id,
        status: booking.status,
        updatedAt: booking.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel booking
router.patch('/:id/cancel', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOne({
      _id: id,
      studentId: req.user!.id,
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel completed booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      message: 'Booking cancelled successfully',
      booking: {
        id: booking._id,
        status: booking.status,
        updatedAt: booking.updatedAt,
      },
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
