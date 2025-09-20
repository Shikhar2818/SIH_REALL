import express from 'express';
import { authenticateToken, requireCounsellor, AuthRequest } from '../middleware/auth';
import Booking from '../models/Booking';
import User from '../models/User';

const router = express.Router();

// Get counsellor's bookings
router.get('/bookings', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const bookings = await Booking.find({ counsellorId: req.user!.id })
      .populate('studentId', 'name email rollNumber')
      .sort({ slotStart: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error('Get counsellor bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update booking status
router.patch('/bookings/:id/status', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      counsellorId: req.user!.id,
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = status;
    await booking.save();

    res.json({
      message: 'Booking status updated successfully',
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

// Get counsellor's profile
router.get('/profile', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const counsellor = await User.findById(req.user!.id).select('-hashedPassword');
    
    if (!counsellor) {
      return res.status(404).json({ error: 'Counsellor not found' });
    }

    res.json({ counsellor });
  } catch (error) {
    console.error('Get counsellor profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update counsellor's profile
router.patch('/profile', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const { name, languages, availabilitySlots } = req.body;

    const counsellor = await User.findById(req.user!.id);
    
    if (!counsellor) {
      return res.status(404).json({ error: 'Counsellor not found' });
    }

    if (name) counsellor.name = name;
    
    await counsellor.save();

    res.json({
      message: 'Profile updated successfully',
      counsellor: {
        id: counsellor._id,
        name: counsellor.name,
        email: counsellor.email,
        role: counsellor.role,
      },
    });
  } catch (error) {
    console.error('Update counsellor profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get counsellor's statistics
router.get('/stats', authenticateToken, requireCounsellor, async (req: AuthRequest, res) => {
  try {
    const totalBookings = await Booking.countDocuments({ counsellorId: req.user!.id });
    const pendingBookings = await Booking.countDocuments({ 
      counsellorId: req.user!.id, 
      status: 'pending' 
    });
    const confirmedBookings = await Booking.countDocuments({ 
      counsellorId: req.user!.id, 
      status: 'confirmed' 
    });
    const completedBookings = await Booking.countDocuments({ 
      counsellorId: req.user!.id, 
      status: 'completed' 
    });

    const recentBookings = await Booking.countDocuments({
      counsellorId: req.user!.id,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    res.json({
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        recent: recentBookings,
      },
    });
  } catch (error) {
    console.error('Get counsellor stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
