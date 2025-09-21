"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const User_1 = __importDefault(require("../models/User"));
const Booking_1 = __importDefault(require("../models/Booking"));
const Screening_1 = __importDefault(require("../models/Screening"));
const ForumPost_1 = __importDefault(require("../models/ForumPost"));
const Resource_1 = __importDefault(require("../models/Resource"));
const Notification_1 = __importDefault(require("../models/Notification"));
const router = express_1.default.Router();
router.get('/bookings', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { status, counsellorId, studentId, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status && status !== 'all') {
            filter.status = status;
        }
        if (counsellorId) {
            filter.counsellorId = counsellorId;
        }
        if (studentId) {
            filter.studentId = studentId;
        }
        const bookings = await Booking_1.default.find(filter)
            .populate('studentId', 'name email rollNumber')
            .populate('counsellorId', 'name email')
            .sort({ slotStart: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await Booking_1.default.countDocuments(filter);
        const stats = await Booking_1.default.aggregate([
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
    }
    catch (error) {
        console.error('Get admin bookings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/bookings/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const booking = await Booking_1.default.findById(req.params.id)
            .populate('studentId', 'name email rollNumber collegeId')
            .populate('counsellorId', 'name email');
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json({ booking });
    }
    catch (error) {
        console.error('Get booking details error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/forum/posts', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { status, category, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status === 'pending') {
            filter.isApproved = false;
        }
        else if (status === 'approved') {
            filter.isApproved = true;
        }
        if (category && category !== 'all') {
            filter.category = category;
        }
        const posts = await ForumPost_1.default.find(filter)
            .populate('authorId', 'name email role')
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await ForumPost_1.default.countDocuments(filter);
        res.json({
            posts,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            total,
        });
    }
    catch (error) {
        console.error('Get forum posts for moderation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.patch('/forum/posts/:id/approve', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const post = await ForumPost_1.default.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true }).populate('authorId', 'name email');
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        await Notification_1.default.create({
            recipientId: post.authorId._id,
            senderId: req.user.id,
            type: 'post_approval',
            title: 'Post Approved',
            message: `Your post "${post.title}" has been approved and is now visible to the community.`,
            priority: 'medium',
        });
        res.json({
            message: 'Post approved successfully',
            post,
        });
    }
    catch (error) {
        console.error('Approve post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.patch('/forum/posts/:id/reject', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { reason } = req.body;
        const post = await ForumPost_1.default.findByIdAndUpdate(req.params.id, { isApproved: false }, { new: true }).populate('authorId', 'name email');
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        await Notification_1.default.create({
            recipientId: post.authorId._id,
            senderId: req.user.id,
            type: 'post_approval',
            title: 'Post Not Approved',
            message: `Your post "${post.title}" was not approved.${reason ? ` Reason: ${reason}` : ''}`,
            priority: 'medium',
        });
        res.json({
            message: 'Post rejected successfully',
            post,
        });
    }
    catch (error) {
        console.error('Reject post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/forum/posts/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { reason } = req.body;
        const post = await ForumPost_1.default.findById(req.params.id).populate('authorId', 'name email');
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        await Notification_1.default.create({
            recipientId: post.authorId._id,
            senderId: req.user.id,
            type: 'post_approval',
            title: 'Post Deleted',
            message: `Your post "${post.title}" has been deleted by an administrator.${reason ? ` Reason: ${reason}` : ''}`,
            priority: 'high',
        });
        await ForumPost_1.default.findByIdAndDelete(req.params.id);
        res.json({
            message: 'Post deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/users/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (userId === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }
        const activeBookings = await Booking_1.default.countDocuments({
            $or: [
                { studentId: userId, status: { $in: ['pending', 'confirmed'] } },
                { counsellorId: userId, status: { $in: ['pending', 'confirmed'] } }
            ]
        });
        if (activeBookings > 0) {
            return res.status(400).json({
                error: 'Cannot delete user with active bookings. Please handle bookings first.'
            });
        }
        await Promise.all([
            User_1.default.findByIdAndDelete(userId),
            Booking_1.default.deleteMany({ $or: [{ studentId: userId }, { counsellorId: userId }] }),
            Screening_1.default.deleteMany({ userId }),
            ForumPost_1.default.deleteMany({ authorId: userId }),
            Notification_1.default.deleteMany({ $or: [{ recipientId: userId }, { senderId: userId }] })
        ]);
        res.json({
            message: 'User deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/alerts/mental-health', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { timeframe = '7' } = req.query;
        const days = parseInt(timeframe);
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const severeScreenings = await Screening_1.default.find({
            severity: { $in: ['moderately_severe', 'severe'] },
            createdAt: { $gte: startDate },
        })
            .populate('userId', 'name email rollNumber')
            .sort({ createdAt: -1 });
        const concerningPosts = await ForumPost_1.default.find({
            category: { $in: ['anxiety', 'depression', 'stress'] },
            mood: { $in: ['sad', 'anxious', 'stressed', 'overwhelmed'] },
            createdAt: { $gte: startDate },
            isApproved: true,
        })
            .populate('authorId', 'name email')
            .sort({ createdAt: -1 });
        const noShowBookings = await Booking_1.default.find({
            status: 'no_show',
            slotStart: { $gte: startDate },
        })
            .populate('studentId', 'name email')
            .populate('counsellorId', 'name')
            .sort({ slotStart: -1 });
        res.json({
            timeframe: days,
            severeScreenings,
            concerningPosts,
            noShowBookings,
            totalAlerts: severeScreenings.length + concerningPosts.length + noShowBookings.length,
        });
    }
    catch (error) {
        console.error('Get mental health alerts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/users/search', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { search, role, status, hasBookings, hasScreenings, lastActive, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { rollNumber: { $regex: search, $options: 'i' } },
                { collegeId: { $regex: search, $options: 'i' } },
            ];
        }
        if (role && role !== 'all') {
            filter.role = role;
        }
        if (status === 'active') {
            filter.isActive = true;
        }
        else if (status === 'inactive') {
            filter.isActive = false;
        }
        if (lastActive) {
            const days = parseInt(lastActive);
            const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            filter.updatedAt = { $gte: date };
        }
        let users = await User_1.default.find(filter)
            .select('-hashedPassword')
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        if (hasBookings === 'true') {
            const usersWithBookings = await Booking_1.default.distinct('studentId');
            users = users.filter(user => usersWithBookings.some(id => id.toString() === user._id.toString()));
        }
        if (hasScreenings === 'true') {
            const usersWithScreenings = await Screening_1.default.distinct('userId');
            users = users.filter(user => usersWithScreenings.some(id => id.toString() === user._id.toString()));
        }
        const userStats = await Promise.all(users.map(async (user) => {
            const [bookings, screenings, posts] = await Promise.all([
                Booking_1.default.countDocuments({ $or: [{ studentId: user._id }, { counsellorId: user._id }] }),
                Screening_1.default.countDocuments({ userId: user._id }),
                ForumPost_1.default.countDocuments({ authorId: user._id }),
            ]);
            return {
                ...user.toObject(),
                stats: { bookings, screenings, posts },
            };
        }));
        const total = await User_1.default.countDocuments(filter);
        res.json({
            users: userStats,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            total,
        });
    }
    catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/resources', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { category, status, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (category && category !== 'all') {
            filter.category = category;
        }
        if (status === 'published') {
            filter.isPublished = true;
        }
        else if (status === 'draft') {
            filter.isPublished = false;
        }
        const resources = await Resource_1.default.find(filter)
            .populate('authorId', 'name email')
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await Resource_1.default.countDocuments(filter);
        res.json({
            resources,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            total,
        });
    }
    catch (error) {
        console.error('Get resources error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/resources', [
    auth_1.authenticateToken,
    auth_1.requireAdmin,
    (0, express_validator_1.body)('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
    (0, express_validator_1.body)('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be 10-500 characters'),
    (0, express_validator_1.body)('content').trim().isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
    (0, express_validator_1.body)('category').isIn(['article', 'video', 'document', 'link', 'exercise', 'guide']).withMessage('Invalid category'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { title, description, content, category, tags, fileUrl, thumbnailUrl } = req.body;
        const resource = new Resource_1.default({
            title,
            description,
            content,
            category,
            tags: tags || [],
            authorId: req.user.id,
            fileUrl,
            thumbnailUrl,
            isPublished: false,
        });
        await resource.save();
        const populatedResource = await Resource_1.default.findById(resource._id)
            .populate('authorId', 'name email');
        res.status(201).json({
            message: 'Resource created successfully',
            resource: populatedResource,
        });
    }
    catch (error) {
        console.error('Create resource error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.patch('/resources/:id', [
    auth_1.authenticateToken,
    auth_1.requireAdmin,
], async (req, res) => {
    try {
        const { title, description, content, category, tags, isPublished, featured, fileUrl, thumbnailUrl } = req.body;
        const resource = await Resource_1.default.findByIdAndUpdate(req.params.id, {
            title,
            description,
            content,
            category,
            tags,
            isPublished,
            featured,
            fileUrl,
            thumbnailUrl,
        }, { new: true }).populate('authorId', 'name email');
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        res.json({
            message: 'Resource updated successfully',
            resource,
        });
    }
    catch (error) {
        console.error('Update resource error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/resources/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const resource = await Resource_1.default.findByIdAndDelete(req.params.id);
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        res.json({
            message: 'Resource deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete resource error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=adminExtended.js.map