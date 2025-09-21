"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const User_1 = __importDefault(require("../models/User"));
const Booking_1 = __importDefault(require("../models/Booking"));
const Screening_1 = __importDefault(require("../models/Screening"));
const ForumPost_1 = __importDefault(require("../models/ForumPost"));
const router = express_1.default.Router();
router.get('/dashboard', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        console.log('📊 Analytics dashboard request received');
        const userStats = await User_1.default.aggregate([
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
        const bookingStats = await Booking_1.default.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        const recentBookings = await Booking_1.default.find({})
            .populate('studentId', 'name email')
            .populate('counsellorId', 'name email')
            .sort({ createdAt: -1 })
            .limit(10);
        const counsellorStats = await Booking_1.default.aggregate([
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
        const screeningStats = await Screening_1.default.aggregate([
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
        const mentalHealthTrends = await Screening_1.default.aggregate([
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
        const forumStats = await ForumPost_1.default.aggregate([
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
        const moodStats = await ForumPost_1.default.aggregate([
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
        const recentActivity = await Promise.all([
            Booking_1.default.find({})
                .populate('studentId', 'name')
                .populate('counsellorId', 'name')
                .sort({ createdAt: -1 })
                .limit(5)
                .then(bookings => bookings.map(booking => ({
                type: 'booking',
                title: `New booking: ${booking.studentId?.name || 'Unknown Student'} with ${booking.counsellorId?.name || 'Unknown Counsellor'}`,
                status: booking.status,
                timestamp: booking.createdAt,
                data: booking
            }))),
            Screening_1.default.find({})
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
            ForumPost_1.default.find({ isApproved: true })
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
        const allActivities = recentActivity.flat().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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
    }
    catch (error) {
        console.error('❌ Analytics dashboard error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});
router.get('/bookings/analytics', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { timeframe = '30' } = req.query;
        const days = parseInt(timeframe);
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const bookingTrends = await Booking_1.default.aggregate([
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
        const statusDistribution = await Booking_1.default.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        const counsellorDistribution = await Booking_1.default.aggregate([
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
    }
    catch (error) {
        console.error('Booking analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/bookings/realtime', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const realtimeBookings = await Booking_1.default.find({})
            .populate('studentId', 'name email')
            .populate('counsellorId', 'name email')
            .sort({ updatedAt: -1 })
            .limit(parseInt(limit));
        res.json({ bookings: realtimeBookings });
    }
    catch (error) {
        console.error('Real-time bookings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.patch('/bookings/:id/status', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { status, counsellorNotes } = req.body;
        const booking = await Booking_1.default.findById(req.params.id)
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
    }
    catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/mental-health/alerts', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const severeCases = await Screening_1.default.aggregate([
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
        const concerningPosts = await ForumPost_1.default.aggregate([
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
    }
    catch (error) {
        console.error('Mental health alerts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=adminAnalytics.js.map