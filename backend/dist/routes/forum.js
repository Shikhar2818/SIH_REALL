"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const ForumPost_1 = __importDefault(require("../models/ForumPost"));
const notificationService_1 = __importDefault(require("../services/notificationService"));
const router = express_1.default.Router();
router.get('/posts', async (req, res) => {
    try {
        const { category, mood, page = 1, limit = 10 } = req.query;
        const filter = { isApproved: true };
        if (category && category !== 'all') {
            filter.category = category;
        }
        if (mood) {
            filter.mood = mood;
        }
        const posts = await ForumPost_1.default.find(filter)
            .populate('authorId', 'name role')
            .populate('likes', 'name')
            .populate('comments.authorId', 'name role')
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
        console.error('Get forum posts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/posts/:id', async (req, res) => {
    try {
        const post = await ForumPost_1.default.findById(req.params.id)
            .populate('authorId', 'name role')
            .populate('likes', 'name')
            .populate('comments.authorId', 'name role');
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json({ post });
    }
    catch (error) {
        console.error('Get forum post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/posts', [
    auth_1.authenticateToken,
    (0, express_validator_1.body)('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
    (0, express_validator_1.body)('content').trim().isLength({ min: 10, max: 2000 }).withMessage('Content must be 10-2000 characters'),
    (0, express_validator_1.body)('category').isIn(['general', 'anxiety', 'depression', 'stress', 'support', 'achievement']).withMessage('Invalid category'),
    (0, express_validator_1.body)('tags').optional().isArray().withMessage('Tags must be an array'),
    (0, express_validator_1.body)('isAnonymous').optional().isBoolean().withMessage('isAnonymous must be boolean'),
    (0, express_validator_1.body)('mood').optional().isIn(['happy', 'sad', 'anxious', 'stressed', 'calm', 'overwhelmed']).withMessage('Invalid mood'),
], async (req, res) => {
    try {
        console.log('Forum post creation request:', req.body);
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log('Forum post validation errors:', errors.array());
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { title, content, category, tags, isAnonymous, mood } = req.body;
        const post = new ForumPost_1.default({
            authorId: req.user.id,
            title,
            content,
            category,
            tags: tags || [],
            isAnonymous,
            mood,
        });
        await post.save();
        if (category && mood && ['anxiety', 'depression', 'stress'].includes(category)) {
            await notificationService_1.default.createConcerningPostAlert(post._id.toString(), req.user.id, category, mood);
        }
        const populatedPost = await ForumPost_1.default.findById(post._id)
            .populate('authorId', 'name role');
        res.status(201).json({
            message: 'Post created successfully',
            post: populatedPost,
        });
    }
    catch (error) {
        console.error('Create forum post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/posts/:id/like', auth_1.authenticateToken, async (req, res) => {
    try {
        const post = await ForumPost_1.default.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const userId = req.user.id;
        const isLiked = post.likes.includes(userId);
        if (isLiked) {
            post.likes = post.likes.filter(id => !id.equals(userId));
        }
        else {
            post.likes.push(userId);
        }
        await post.save();
        res.json({
            message: isLiked ? 'Post unliked' : 'Post liked',
            isLiked: !isLiked,
            likesCount: post.likes.length,
        });
    }
    catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/posts/:id/comments', [
    auth_1.authenticateToken,
    (0, express_validator_1.body)('content').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be 1-500 characters'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const post = await ForumPost_1.default.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        post.comments.push({
            authorId: req.user.id,
            content: req.body.content,
            createdAt: new Date(),
        });
        await post.save();
        const updatedPost = await ForumPost_1.default.findById(post._id)
            .populate('comments.authorId', 'name role');
        res.status(201).json({
            message: 'Comment added successfully',
            post: updatedPost,
        });
    }
    catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/my-posts', auth_1.authenticateToken, auth_1.requireStudent, async (req, res) => {
    try {
        const posts = await ForumPost_1.default.find({ authorId: req.user.id })
            .populate('authorId', 'name role')
            .populate('likes', 'name')
            .populate('comments.authorId', 'name role')
            .sort({ createdAt: -1 });
        res.json({ posts });
    }
    catch (error) {
        console.error('Get user posts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/stats', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const totalPosts = await ForumPost_1.default.countDocuments();
        const approvedPosts = await ForumPost_1.default.countDocuments({ isApproved: true });
        const pendingPosts = await ForumPost_1.default.countDocuments({ isApproved: false });
        const categoryStats = await ForumPost_1.default.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                },
            },
        ]);
        const moodStats = await ForumPost_1.default.aggregate([
            {
                $match: { mood: { $exists: true } },
            },
            {
                $group: {
                    _id: '$mood',
                    count: { $sum: 1 },
                },
            },
        ]);
        const recentPosts = await ForumPost_1.default.find({ isApproved: true })
            .populate('authorId', 'name')
            .sort({ createdAt: -1 })
            .limit(5);
        res.json({
            totalPosts,
            approvedPosts,
            pendingPosts,
            categoryStats,
            moodStats,
            recentPosts,
        });
    }
    catch (error) {
        console.error('Get forum stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=forum.js.map