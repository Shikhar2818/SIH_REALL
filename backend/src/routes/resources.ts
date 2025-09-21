import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Resource from '../models/Resource';
import User from '../models/User';

const router = express.Router();

// Get all published resources
router.get('/', async (req, res) => {
  try {
    const { category, featured, limit = 20, page = 1 } = req.query;
    
    const filter: any = { isPublished: true };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (featured === 'true') {
      filter.featured = true;
    }

    const resources = await Resource.find(filter)
      .populate('authorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Resource.countDocuments(filter);

    res.json({
      resources,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get resource by ID
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findOne({
      _id: req.params.id,
      isPublished: true
    }).populate('authorId', 'name email');

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Increment view count
    resource.viewCount += 1;
    await resource.save();

    res.json({ resource });
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes for resource management
router.post('/', [
  authenticateToken,
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description must be 1-500 characters'),
  body('category').isIn(['article', 'video', 'document', 'link', 'exercise', 'guide']).withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('youtubeUrl').optional().isURL().withMessage('Invalid YouTube URL'),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is admin
    const user = await User.findById(req.user!.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { title, description, content, category, tags, youtubeUrl, youtubeId, isPublished, featured } = req.body;

    const resource = new Resource({
      title,
      description,
      content: content || '',
      category,
      tags: tags || [],
      authorId: req.user!.id,
      isPublished: isPublished || false,
      featured: featured || false,
      youtubeUrl,
      youtubeId,
    });

    await resource.save();

    const populatedResource = await Resource.findById(resource._id)
      .populate('authorId', 'name email');

    res.status(201).json({
      message: 'Resource created successfully',
      resource: populatedResource,
    });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update resource (admin only)
router.patch('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user!.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const updates = req.body;
    Object.assign(resource, updates);
    await resource.save();

    const populatedResource = await Resource.findById(resource._id)
      .populate('authorId', 'name email');

    res.json({
      message: 'Resource updated successfully',
      resource: populatedResource,
    });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete resource (admin only)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user!.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all resources for admin (including unpublished)
router.get('/admin/all', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user!.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { category, page = 1, limit = 20 } = req.query;
    
    const filter: any = {};
    if (category && category !== 'all') {
      filter.category = category;
    }

    const resources = await Resource.find(filter)
      .populate('authorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Resource.countDocuments(filter);

    res.json({
      resources,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    console.error('Get admin resources error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
