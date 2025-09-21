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
router.get('/users', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const users = await User_1.default.find({})
            .select('-hashedPassword')
            .sort({ createdAt: -1 });
        res.json({ users });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/users/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id).select('-hashedPassword');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.patch('/users/:id/role', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['student', 'admin', 'counsellor'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        const user = await User_1.default.findById(req.params.id);
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
    }
    catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/user-stats/:userId', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const [screenings, bookings, forumPosts] = await Promise.all([
            Screening_1.default.countDocuments({ userId }),
            Booking_1.default.countDocuments({ userId }),
            ForumPost_1.default.countDocuments({ authorId: userId }),
        ]);
        res.json({
            screenings,
            bookings,
            forumPosts,
        });
    }
    catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.patch('/users/:userId/status', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;
        const user = await User_1.default.findByIdAndUpdate(userId, { isActive }, { new: true });
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
    }
    catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.patch('/users/:id/status', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { isActive } = req.body;
        const user = await User_1.default.findById(req.params.id);
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
    }
    catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/bookings', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const bookings = await Booking_1.default.find({})
            .populate('studentId', 'name email')
            .populate('counsellorId', 'name email')
            .sort({ createdAt: -1 });
        res.json({ bookings });
    }
    catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/analytics/screenings', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const phq9Stats = await Screening_1.default.aggregate([
            { $match: { type: 'PHQ9' } },
            {
                $group: {
                    _id: '$severity',
                    count: { $sum: 1 },
                    avgScore: { $avg: '$totalScore' },
                },
            },
        ]);
        const gad7Stats = await Screening_1.default.aggregate([
            { $match: { type: 'GAD7' } },
            {
                $group: {
                    _id: '$severity',
                    count: { $sum: 1 },
                    avgScore: { $avg: '$totalScore' },
                },
            },
        ]);
        const totalScreenings = await Screening_1.default.countDocuments();
        const recentScreenings = await Screening_1.default.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        });
        res.json({
            totalScreenings,
            recentScreenings,
            phq9Stats,
            gad7Stats,
        });
    }
    catch (error) {
        console.error('Get screening analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/stats', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const totalUsers = await User_1.default.countDocuments();
        const activeUsers = await User_1.default.countDocuments({ isActive: true });
        const students = await User_1.default.countDocuments({ role: 'student' });
        const counsellors = await User_1.default.countDocuments({ role: 'counsellor' });
        const admins = await User_1.default.countDocuments({ role: 'admin' });
        const totalBookings = await Booking_1.default.countDocuments();
        const pendingBookings = await Booking_1.default.countDocuments({ status: 'pending' });
        const confirmedBookings = await Booking_1.default.countDocuments({ status: 'confirmed' });
        const completedBookings = await Booking_1.default.countDocuments({ status: 'completed' });
        const totalScreenings = await Screening_1.default.countDocuments();
        const recentScreenings = await Screening_1.default.countDocuments({
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        });
        const totalForumPosts = await ForumPost_1.default.countDocuments();
        const approvedForumPosts = await ForumPost_1.default.countDocuments({ isApproved: true });
        const mentalHealthInsights = await Screening_1.default.aggregate([
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
        const moodInsights = await ForumPost_1.default.aggregate([
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
        const categoryInsights = await ForumPost_1.default.aggregate([
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
        const recentActivity = await ForumPost_1.default.find({ isApproved: true })
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
    }
    catch (error) {
        console.error('Get platform stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/analytics/mental-health', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { timeframe = '30' } = req.query;
        const days = parseInt(timeframe);
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const screeningAnalytics = await Screening_1.default.aggregate([
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
        const moodAnalytics = await ForumPost_1.default.aggregate([
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
        const concernAnalytics = await ForumPost_1.default.aggregate([
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
    }
    catch (error) {
        console.error('Get mental health analytics error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map