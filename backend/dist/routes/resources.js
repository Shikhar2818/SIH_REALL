"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const Resource_1 = __importDefault(require("../models/Resource"));
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const { category, featured, limit = 20, page = 1 } = req.query;
        const filter = { isPublished: true };
        if (category && category !== 'all') {
            filter.category = category;
        }
        if (featured === 'true') {
            filter.featured = true;
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
router.get('/:id', async (req, res) => {
    try {
        const resource = await Resource_1.default.findOne({
            _id: req.params.id,
            isPublished: true
        }).populate('authorId', 'name email');
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        resource.viewCount += 1;
        await resource.save();
        res.json({ resource });
    }
    catch (error) {
        console.error('Get resource error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', [
    auth_1.authenticateToken,
    (0, express_validator_1.body)('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
    (0, express_validator_1.body)('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description must be 1-500 characters'),
    (0, express_validator_1.body)('category').isIn(['article', 'video', 'document', 'link', 'exercise', 'guide']).withMessage('Invalid category'),
    (0, express_validator_1.body)('tags').optional().isArray().withMessage('Tags must be an array'),
    (0, express_validator_1.body)('youtubeUrl').optional().isURL().withMessage('Invalid YouTube URL'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const user = await User_1.default.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { title, description, content, category, tags, youtubeUrl, youtubeId, isPublished, featured } = req.body;
        const resource = new Resource_1.default({
            title,
            description,
            content: content || '',
            category,
            tags: tags || [],
            authorId: req.user.id,
            isPublished: isPublished || false,
            featured: featured || false,
            youtubeUrl,
            youtubeId,
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
router.patch('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const resource = await Resource_1.default.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        const updates = req.body;
        Object.assign(resource, updates);
        await resource.save();
        const populatedResource = await Resource_1.default.findById(resource._id)
            .populate('authorId', 'name email');
        res.json({
            message: 'Resource updated successfully',
            resource: populatedResource,
        });
    }
    catch (error) {
        console.error('Update resource error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const resource = await Resource_1.default.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        await Resource_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: 'Resource deleted successfully' });
    }
    catch (error) {
        console.error('Delete resource error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/admin/all', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { category, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (category && category !== 'all') {
            filter.category = category;
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
        console.error('Get admin resources error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=resources.js.map