import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Booking from '../models/Booking';
import Screening from '../models/Screening';
import ForumPost from '../models/ForumPost';
import Resource from '../models/Resource';
import Notification from '../models/Notification';

const router = express.Router();

// Get all bookings with real-time status for admin
router.get('/bookings', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { status, counsellorId, studentId, page = 1, limit = 20 } = req.query;
    
    const filter: any = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (counsellorId) {
      filter.counsellorId = counsellorId;
    }
    
    if (studentId) {
      filter.studentId = studentId;
    }

    const bookings = await Booking.find(filter)
      .populate('studentId', 'name email rollNumber')
      .populate('counsellorId', 'name email')
      .sort({ slotStart: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Booking.countDocuments(filter);

    // Get booking statistics
    const stats = await Booking.aggregate([
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
  } catch (error) {
    console.error('Get admin bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get booking details for admin
router.get('/bookings/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('studentId', 'name email rollNumber collegeId')
      .populate('counsellorId', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Forum post moderation - get all posts for review
router.get('/forum/posts', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    
    const filter: any = {};
    
    if (status === 'pending') {
      filter.isApproved = false;
    } else if (status === 'approved') {
      filter.isApproved = true;
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }

    const posts = await ForumPost.find(filter)
      .populate('authorId', 'name email role')
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
    console.error('Get forum posts for moderation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve forum post
router.patch('/forum/posts/:id/approve', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate('authorId', 'name email');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Create notification for author
    await Notification.create({
      recipientId: post.authorId._id,
      senderId: req.user!.id,
      type: 'post_approval',
      title: 'Post Approved',
      message: `Your post "${post.title}" has been approved and is now visible to the community.`,
      priority: 'medium',
    });

    res.json({
      message: 'Post approved successfully',
      post,
    });
  } catch (error) {
    console.error('Approve post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject forum post
router.patch('/forum/posts/:id/reject', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { reason } = req.body;
    
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      { new: true }
    ).populate('authorId', 'name email');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Create notification for author
    await Notification.create({
      recipientId: post.authorId._id,
      senderId: req.user!.id,
      type: 'post_approval',
      title: 'Post Not Approved',
      message: `Your post "${post.title}" was not approved.${reason ? ` Reason: ${reason}` : ''}`,
      priority: 'medium',
    });

    res.json({
      message: 'Post rejected successfully',
      post,
    });
  } catch (error) {
    console.error('Reject post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete forum post
router.delete('/forum/posts/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { reason } = req.body;
    
    const post = await ForumPost.findById(req.params.id).populate('authorId', 'name email');
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Create notification for author before deleting
    await Notification.create({
      recipientId: post.authorId._id,
      senderId: req.user!.id,
      type: 'post_approval',
      title: 'Post Deleted',
      message: `Your post "${post.title}" has been deleted by an administrator.${reason ? ` Reason: ${reason}` : ''}`,
      priority: 'high',
    });

    await ForumPost.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prevent admin from deleting themselves
    if (userId === req.user!.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    // Check if user has any active bookings
    const activeBookings = await Booking.countDocuments({
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
    
    // Delete user and related data
    await Promise.all([
      User.findByIdAndDelete(userId),
      Booking.deleteMany({ $or: [{ studentId: userId }, { counsellorId: userId }] }),
      Screening.deleteMany({ userId }),
      ForumPost.deleteMany({ authorId: userId }),
      Notification.deleteMany({ $or: [{ recipientId: userId }, { senderId: userId }] })
    ]);

    res.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get mental health alerts for severe cases
router.get('/alerts/mental-health', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { timeframe = '7' } = req.query;
    const days = parseInt(timeframe as string);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get severe screenings
    const severeScreenings = await Screening.find({
      severity: { $in: ['moderately_severe', 'severe'] },
      createdAt: { $gte: startDate },
    })
      .populate('userId', 'name email rollNumber')
      .sort({ createdAt: -1 });

    // Get concerning forum posts
    const concerningPosts = await ForumPost.find({
      category: { $in: ['anxiety', 'depression', 'stress'] },
      mood: { $in: ['sad', 'anxious', 'stressed', 'overwhelmed'] },
      createdAt: { $gte: startDate },
      isApproved: true,
    })
      .populate('authorId', 'name email')
      .sort({ createdAt: -1 });

    // Get no-show bookings (potential red flag)
    const noShowBookings = await Booking.find({
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
  } catch (error) {
    console.error('Get mental health alerts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Advanced user search and filtering
router.get('/users/search', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { 
      search, 
      role, 
      status, 
      hasBookings, 
      hasScreenings, 
      lastActive, 
      page = 1, 
      limit = 20 
    } = req.query;

    const filter: any = {};

    // Text search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { collegeId: { $regex: search, $options: 'i' } },
      ];
    }

    // Role filter
    if (role && role !== 'all') {
      filter.role = role;
    }

    // Status filter
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    // Date filters
    if (lastActive) {
      const days = parseInt(lastActive as string);
      const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      filter.updatedAt = { $gte: date };
    }

    let users = await User.find(filter)
      .select('-hashedPassword')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    // Additional filtering based on activity
    if (hasBookings === 'true') {
      const usersWithBookings = await Booking.distinct('studentId');
      users = users.filter(user => usersWithBookings.some(id => id.toString() === user._id.toString()));
    }

    if (hasScreenings === 'true') {
      const usersWithScreenings = await Screening.distinct('userId');
      users = users.filter(user => usersWithScreenings.some(id => id.toString() === user._id.toString()));
    }

    // Get user statistics
    const userStats = await Promise.all(
      users.map(async (user) => {
        const [bookings, screenings, posts] = await Promise.all([
          Booking.countDocuments({ $or: [{ studentId: user._id }, { counsellorId: user._id }] }),
          Screening.countDocuments({ userId: user._id }),
          ForumPost.countDocuments({ authorId: user._id }),
        ]);

        return {
          ...user.toObject(),
          stats: { bookings, screenings, posts },
        };
      })
    );

    const total = await User.countDocuments(filter);

    res.json({
      users: userStats,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resource management
router.get('/resources', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { category, status, page = 1, limit = 20 } = req.query;
    
    const filter: any = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (status === 'published') {
      filter.isPublished = true;
    } else if (status === 'draft') {
      filter.isPublished = false;
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

// Create new resource
router.post('/resources', [
  authenticateToken,
  requireAdmin,
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be 10-500 characters'),
  body('content').trim().isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
  body('category').isIn(['article', 'video', 'document', 'link', 'exercise', 'guide']).withMessage('Invalid category'),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, content, category, tags, fileUrl, thumbnailUrl } = req.body;

    const resource = new Resource({
      title,
      description,
      content,
      category,
      tags: tags || [],
      authorId: req.user!.id,
      fileUrl,
      thumbnailUrl,
      isPublished: false, // Start as draft
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

// Update resource
router.patch('/resources/:id', [
  authenticateToken,
  requireAdmin,
], async (req: AuthRequest, res) => {
  try {
    const { title, description, content, category, tags, isPublished, featured, fileUrl, thumbnailUrl } = req.body;

    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        content,
        category,
        tags,
        isPublished,
        featured,
        fileUrl,
        thumbnailUrl,
      },
      { new: true }
    ).populate('authorId', 'name email');

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json({
      message: 'Resource updated successfully',
      resource,
    });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete resource
router.delete('/resources/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json({
      message: 'Resource deleted successfully',
    });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
