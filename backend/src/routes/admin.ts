import express from 'express';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Booking from '../models/Booking';
import Screening from '../models/Screening';
import ForumPost from '../models/ForumPost';

const router = express.Router();

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const users = await User.find({})
      .select('-hashedPassword')
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID (admin only)
router.get('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.params.id).select('-hashedPassword');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user role (admin only)
router.patch('/users/:id/role', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { role } = req.body;
    
    if (!['student', 'admin', 'counsellor'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user stats (admin only)
router.get('/user-stats/:userId', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;

    const [screenings, bookings, forumPosts] = await Promise.all([
      Screening.countDocuments({ userId }),
      Booking.countDocuments({ userId }),
      ForumPost.countDocuments({ authorId: userId }),
    ]);

    res.json({
      screenings,
      bookings,
      forumPosts,
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user status (admin only)
router.patch('/users/:userId/status', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User status updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle user active status (admin only)
router.patch('/users/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: 'User status updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all bookings (admin only)
router.get('/bookings', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('studentId', 'name email')
      .populate('counsellorId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get screening analytics (admin only)
router.get('/analytics/screenings', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const phq9Stats = await Screening.aggregate([
      { $match: { type: 'PHQ9' } },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 },
          avgScore: { $avg: '$totalScore' },
        },
      },
    ]);

    const gad7Stats = await Screening.aggregate([
      { $match: { type: 'GAD7' } },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 },
          avgScore: { $avg: '$totalScore' },
        },
      },
    ]);

    const totalScreenings = await Screening.countDocuments();
    const recentScreenings = await Screening.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    res.json({
      totalScreenings,
      recentScreenings,
      phq9Stats,
      gad7Stats,
    });
  } catch (error) {
    console.error('Get screening analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get comprehensive platform statistics (admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const students = await User.countDocuments({ role: 'student' });
    const counsellors = await User.countDocuments({ role: 'counsellor' });
    const admins = await User.countDocuments({ role: 'admin' });

    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });

    const totalScreenings = await Screening.countDocuments();
    const recentScreenings = await Screening.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    const totalForumPosts = await ForumPost.countDocuments();
    const approvedForumPosts = await ForumPost.countDocuments({ isApproved: true });

    // Mental health insights from screenings
    const mentalHealthInsights = await Screening.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 },
          avgScore: { $avg: '$totalScore' },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Mental health insights from forum posts (mood analysis)
    const moodInsights = await ForumPost.aggregate([
      {
        $match: { mood: { $exists: true } },
      },
      {
        $group: {
          _id: '$mood',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Category insights from forum posts
    const categoryInsights = await ForumPost.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Recent activity
    const recentActivity = await ForumPost.find({ isApproved: true })
      .populate('authorId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category mood authorId createdAt');

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        students,
        counsellors,
        admins,
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
      },
      screenings: {
        total: totalScreenings,
        recent: recentScreenings,
      },
      forum: {
        totalPosts: totalForumPosts,
        approvedPosts: approvedForumPosts,
      },
      mentalHealthInsights,
      moodInsights,
      categoryInsights,
      recentActivity,
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get detailed mental health analytics
router.get('/analytics/mental-health', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { timeframe = '30' } = req.query;
    const days = parseInt(timeframe as string);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Screening-based analytics
    const screeningAnalytics = await Screening.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            type: '$type',
            severity: '$severity',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          },
          count: { $sum: 1 },
          avgScore: { $avg: '$totalScore' },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
    ]);

    // Forum-based mood analytics
    const moodAnalytics = await ForumPost.aggregate([
      {
        $match: {
          mood: { $exists: true },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            mood: '$mood',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
    ]);

    // Category-based concerns analytics
    const concernAnalytics = await ForumPost.aggregate([
      {
        $match: {
          category: { $in: ['anxiety', 'depression', 'stress'] },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            category: '$category',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
    ]);

    res.json({
      timeframe: days,
      screeningAnalytics,
      moodAnalytics,
      concernAnalytics,
    });
  } catch (error) {
    console.error('Get mental health analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
