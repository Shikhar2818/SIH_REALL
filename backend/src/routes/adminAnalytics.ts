import express from 'express';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Booking from '../models/Booking';
import Screening from '../models/Screening';
import ForumPost from '../models/ForumPost';
// import Counsellor from '../models/Counsellor'; // Not needed - counsellors are in User model

const router = express.Router();

// Get comprehensive analytics dashboard data
router.get('/dashboard', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    console.log('📊 Analytics dashboard request received');
    // User statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          }
        }
      }
    ]);

    // Booking statistics with real-time data
    const bookingStats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent bookings with full details
    const recentBookings = await Booking.find({})
      .populate('studentId', 'name email')
      .populate('counsellorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Counsellor performance analytics
    const counsellorStats = await Booking.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'counsellorId',
          foreignField: '_id',
          as: 'counsellor'
        }
      },
      {
        $unwind: '$counsellor'
      },
      {
        $group: {
          _id: '$counsellorId',
          counsellorName: { $first: '$counsellor.name' },
          totalBookings: { $sum: 1 },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          noShows: {
            $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] }
          }
        }
      },
      {
        $addFields: {
          confirmationRate: {
            $multiply: [
              { $divide: ['$confirmedBookings', '$totalBookings'] },
              100
            ]
          },
          completionRate: {
            $multiply: [
              { $divide: ['$completedBookings', '$confirmedBookings'] },
              100
            ]
          }
        }
      }
    ]);

    // Screening analytics with trends
    const screeningStats = await Screening.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          avgScore: { $avg: '$totalScore' },
          severityBreakdown: {
            $push: {
              severity: '$severity',
              score: '$totalScore'
            }
          }
        }
      }
    ]);

    // Mental health trends over time
    const mentalHealthTrends = await Screening.aggregate([
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            severity: '$severity'
          },
          count: { $sum: 1 },
          avgScore: { $avg: '$totalScore' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Forum activity analytics
    const forumStats = await ForumPost.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          approvedCount: {
            $sum: { $cond: [{ $eq: ['$isApproved', true] }, 1, 0] }
          }
        }
      }
    ]);

    // Mood analytics from forum posts
    const moodStats = await ForumPost.aggregate([
      {
        $match: { mood: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: '$mood',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Real-time activity feed
    const recentActivity = await Promise.all([
      // Recent bookings
      Booking.find({})
        .populate('studentId', 'name')
        .populate('counsellorId', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .then(bookings => bookings.map(booking => ({
          type: 'booking',
          title: `New booking: ${(booking.studentId as any)?.name || 'Unknown Student'} with ${(booking.counsellorId as any)?.name || 'Unknown Counsellor'}`,
          status: booking.status,
          timestamp: booking.createdAt,
          data: booking
        }))),
      
      // Recent screenings
      Screening.find({})
        .populate('userId', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .then(screenings => screenings.map(screening => ({
          type: 'screening',
          title: `${screening.type} screening completed`,
          severity: screening.severity,
          score: screening.totalScore,
          timestamp: screening.createdAt,
          data: screening
        }))),
      
      // Recent forum posts
      ForumPost.find({ isApproved: true })
        .populate('authorId', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .then(posts => posts.map(post => ({
          type: 'forum_post',
          title: `New post: ${post.title}`,
          category: post.category,
          mood: post.mood,
          timestamp: post.createdAt,
          data: post
        })))
    ]);

    // Combine and sort all activities
    const allActivities = recentActivity.flat().sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    console.log('📊 Analytics data prepared successfully');
    
    res.json({
      userStats,
      bookingStats,
      recentBookings,
      counsellorStats,
      screeningStats,
      mentalHealthTrends,
      forumStats,
      moodStats,
      recentActivity: allActivities.slice(0, 15)
    });

  } catch (error) {
    console.error('❌ Analytics dashboard error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get detailed booking analytics
router.get('/bookings/analytics', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { timeframe = '30' } = req.query;
    const days = parseInt(timeframe as string);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Booking trends over time
    const bookingTrends = await Booking.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Status distribution
    const statusDistribution = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Counsellor booking distribution
    const counsellorDistribution = await Booking.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'counsellorId',
          foreignField: '_id',
          as: 'counsellor'
        }
      },
      {
        $unwind: '$counsellor'
      },
      {
        $group: {
          _id: '$counsellorId',
          counsellorName: { $first: '$counsellor.name' },
          totalBookings: { $sum: 1 },
          statusBreakdown: {
            $push: '$status'
          }
        }
      }
    ]);

    res.json({
      bookingTrends,
      statusDistribution,
      counsellorDistribution
    });

  } catch (error) {
    console.error('Booking analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get real-time booking updates
router.get('/bookings/realtime', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { limit = 50 } = req.query;

    const realtimeBookings = await Booking.find({})
      .populate('studentId', 'name email')
      .populate('counsellorId', 'name email')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit as string));

    res.json({ bookings: realtimeBookings });

  } catch (error) {
    console.error('Real-time bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update booking status with counsellor notes
router.patch('/bookings/:id/status', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { status, counsellorNotes } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('studentId', 'name email')
      .populate('counsellorId', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = status;
    if (counsellorNotes) {
      booking.counsellorNotes = counsellorNotes;
    }

    await booking.save();

    res.json({
      message: 'Booking status updated successfully',
      booking
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get mental health insights and alerts
router.get('/mental-health/alerts', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    // Find severe cases that need attention
    const severeCases = await Screening.aggregate([
      {
        $match: {
          $or: [
            { severity: 'severe' },
            { severity: 'moderately severe' },
            { totalScore: { $gte: 15 } }
          ]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 20
      }
    ]);

    // Concerning forum posts
    const concerningPosts = await ForumPost.aggregate([
      {
        $match: {
          $or: [
            { mood: 'distressed' },
            { mood: 'anxious' },
            { mood: 'depressed' },
            { category: 'crisis' }
          ]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'authorId',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $unwind: '$author'
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      severeCases,
      concerningPosts
    });

  } catch (error) {
    console.error('Mental health alerts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
