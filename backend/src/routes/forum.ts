import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireStudent, AuthRequest } from '../middleware/auth';
import ForumPost from '../models/ForumPost';
import User from '../models/User';

const router = express.Router();

// Get all approved forum posts
router.get('/posts', async (req, res) => {
  try {
    const { category, mood, page = 1, limit = 10 } = req.query;
    
    const filter: any = { isApproved: true };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (mood) {
      filter.mood = mood;
    }

    const posts = await ForumPost.find(filter)
      .populate('authorId', 'name role')
      .populate('likes', 'name')
      .populate('comments.authorId', 'name role')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await ForumPost.countDocuments(filter);

    res.json({
      posts,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    console.error('Get forum posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get post by ID
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('authorId', 'name role')
      .populate('likes', 'name')
      .populate('comments.authorId', 'name role');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Get forum post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new forum post
router.post('/posts', [
  authenticateToken,
  requireStudent,
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('content').trim().isLength({ min: 10, max: 2000 }).withMessage('Content must be 10-2000 characters'),
  body('category').isIn(['general', 'anxiety', 'depression', 'stress', 'support', 'achievement']).withMessage('Invalid category'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isAnonymous').optional().isBoolean().withMessage('isAnonymous must be boolean'),
  body('mood').optional().isIn(['happy', 'sad', 'anxious', 'stressed', 'calm', 'overwhelmed']).withMessage('Invalid mood'),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category, tags, isAnonymous, mood } = req.body;

    const post = new ForumPost({
      authorId: req.user!.id,
      title,
      content,
      category,
      tags: tags || [],
      isAnonymous,
      mood,
    });

    await post.save();

    const populatedPost = await ForumPost.findById(post._id)
      .populate('authorId', 'name role');

    res.status(201).json({
      message: 'Post created successfully',
      post: populatedPost,
    });
  } catch (error) {
    console.error('Create forum post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Like/unlike a post
router.post('/posts/:id/like', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const userId = req.user!.id;
    const isLiked = post.likes.includes(userId as any);

    if (isLiked) {
      post.likes = post.likes.filter(id => !id.equals(userId as any));
    } else {
      post.likes.push(userId as any);
    }

    await post.save();

    res.json({
      message: isLiked ? 'Post unliked' : 'Post liked',
      isLiked: !isLiked,
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add comment to post
router.post('/posts/:id/comments', [
  authenticateToken,
  requireStudent,
  body('content').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be 1-500 characters'),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.comments.push({
      authorId: req.user!.id as any,
      content: req.body.content,
      createdAt: new Date(),
    });

    await post.save();

    const updatedPost = await ForumPost.findById(post._id)
      .populate('comments.authorId', 'name role');

    res.status(201).json({
      message: 'Comment added successfully',
      post: updatedPost,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's posts
router.get('/my-posts', authenticateToken, requireStudent, async (req: AuthRequest, res) => {
  try {
    const posts = await ForumPost.find({ authorId: req.user!.id })
      .populate('authorId', 'name role')
      .populate('likes', 'name')
      .populate('comments.authorId', 'name role')
      .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get forum statistics for admin
router.get('/stats', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Check if user is admin
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const totalPosts = await ForumPost.countDocuments();
    const approvedPosts = await ForumPost.countDocuments({ isApproved: true });
    const pendingPosts = await ForumPost.countDocuments({ isApproved: false });

    const categoryStats = await ForumPost.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    const moodStats = await ForumPost.aggregate([
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

    const recentPosts = await ForumPost.find({ isApproved: true })
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
  } catch (error) {
    console.error('Get forum stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
