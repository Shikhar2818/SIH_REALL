"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const User_1 = __importDefault(require("../models/User"));
const Booking_1 = __importDefault(require("../models/Booking"));
const notificationService_1 = __importDefault(require("../services/notificationService"));
const router = express_1.default.Router();
const getCounsellorUserId = async (userId) => {
    const user = await User_1.default.findById(userId);
    if (!user || user.role !== 'counsellor')
        return null;
    return user._id;
};
router.get('/all-bookings', auth_1.authenticateToken, auth_1.requireCounsellor, async (req, res) => {
    try {
        const counsellorUserId = await getCounsellorUserId(req.user.id);
        if (!counsellorUserId) {
            return res.status(404).json({ error: 'Counsellor profile not found' });
        }
        const { status, page = 1, limit = 20, search } = req.query;
        const filter = { counsellorId: counsellorUserId };
        if (status && status !== 'all') {
            filter.status = status;
        }
        const bookings = await Booking_1.default.find(filter)
            .populate('studentId', 'name email')
            .populate('counsellorId', 'name email')
            .sort({ slotStart: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        let filteredBookings = bookings;
        if (search) {
            const searchTerm = search.toLowerCase();
            filteredBookings = bookings.filter(booking => {
                const student = booking.studentId;
                return student?.name?.toLowerCase().includes(searchTerm) ||
                    student?.email?.toLowerCase().includes(searchTerm);
            });
        }
        const total = await Booking_1.default.countDocuments(filter);
        res.json({
            bookings: filteredBookings,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            total,
        });
    }
    catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});
router.get('/pending-bookings', auth_1.authenticateToken, auth_1.requireCounsellor, async (req, res) => {
    try {
        const counsellorUserId = await getCounsellorUserId(req.user.id);
        if (!counsellorUserId) {
            return res.status(404).json({ error: 'Counsellor profile not found' });
        }
        const pendingBookings = await Booking_1.default.find({
            counsellorId: counsellorUserId,
            status: 'pending'
        })
            .populate('studentId', 'name email')
            .populate('counsellorId', 'name email')
            .sort({ createdAt: -1 });
        res.json({ bookings: pendingBookings });
    }
    catch (error) {
        console.error('Get pending bookings error:', error);
        res.status(500).json({ error: 'Failed to fetch pending bookings' });
    }
});
router.patch('/bookings/:id/approve', auth_1.authenticateToken, auth_1.requireCounsellor, async (req, res) => {
    try {
        const counsellorUserId = await getCounsellorUserId(req.user.id);
        if (!counsellorUserId) {
            return res.status(404).json({ error: 'Counsellor profile not found' });
        }
        const { notes } = req.body;
        const booking = await Booking_1.default.findOne({
            _id: req.params.id,
            counsellorId: counsellorUserId,
            status: 'pending'
        }).populate('studentId', 'name email');
        if (!booking) {
            return res.status(404).json({ error: 'Pending booking not found' });
        }
        booking.status = 'confirmed';
        if (notes) {
            booking.counsellorNotes = notes;
        }
        await booking.save();
        await notificationService_1.default.createBookingNotification(booking._id.toString(), counsellorUserId.toString(), booking.studentId._id.toString(), 'approved');
        res.json({
            message: 'Booking approved successfully',
            booking,
        });
    }
    catch (error) {
        console.error('Approve booking error:', error);
        res.status(500).json({ error: 'Failed to approve booking' });
    }
});
router.patch('/bookings/:id/reject', auth_1.authenticateToken, auth_1.requireCounsellor, async (req, res) => {
    try {
        const counsellorUserId = await getCounsellorUserId(req.user.id);
        if (!counsellorUserId) {
            return res.status(404).json({ error: 'Counsellor profile not found' });
        }
        const { reason } = req.body;
        const booking = await Booking_1.default.findOne({
            _id: req.params.id,
            counsellorId: counsellorUserId,
            status: 'pending'
        }).populate('studentId', 'name email');
        if (!booking) {
            return res.status(404).json({ error: 'Pending booking not found' });
        }
        booking.status = 'cancelled';
        booking.cancellationReason = reason || 'Cancelled by counsellor';
        await booking.save();
        await notificationService_1.default.createBookingNotification(booking._id.toString(), counsellorUserId.toString(), booking.studentId._id.toString(), 'cancelled');
        res.json({
            message: 'Booking rejected successfully',
            booking,
        });
    }
    catch (error) {
        console.error('Reject booking error:', error);
        res.status(500).json({ error: 'Failed to reject booking' });
    }
});
router.get('/dashboard-summary', auth_1.authenticateToken, auth_1.requireCounsellor, async (req, res) => {
    try {
        const counsellorUserId = await getCounsellorUserId(req.user.id);
        if (!counsellorUserId) {
            return res.status(404).json({ error: 'Counsellor profile not found' });
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayBookings = await Booking_1.default.find({
            counsellorId: counsellorUserId,
            slotStart: { $gte: today, $lt: tomorrow },
            status: { $in: ['confirmed', 'completed'] }
        }).populate('studentId', 'name email');
        const pendingCount = await Booking_1.default.countDocuments({
            counsellorId: counsellorUserId,
            status: 'pending'
        });
        const upcomingBookings = await Booking_1.default.find({
            counsellorId: counsellorUserId,
            slotStart: { $gte: tomorrow },
            status: { $in: ['confirmed', 'pending'] }
        }).populate('studentId', 'name email').sort({ slotStart: 1 });
        const recentSessions = await Booking_1.default.find({
            counsellorId: counsellorUserId,
            status: 'completed',
            slotStart: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }).populate('studentId', 'name email').sort({ slotStart: -1 });
        const totalStudents = await Booking_1.default.distinct('studentId', {
            counsellorId: counsellorUserId
        });
        res.json({
            todayBookings,
            pendingCount,
            upcomingBookings,
            recentSessions,
            totalStudents: totalStudents.length,
            summary: {
                todaySessions: todayBookings.length,
                pendingApprovals: pendingCount,
                upcomingSessions: upcomingBookings.length,
                totalStudents: totalStudents.length
            }
        });
    }
    catch (error) {
        console.error('Dashboard summary error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard summary' });
    }
});
router.get('/bookings/:id', auth_1.authenticateToken, auth_1.requireCounsellor, async (req, res) => {
    try {
        const counsellorUserId = await getCounsellorUserId(req.user.id);
        if (!counsellorUserId) {
            return res.status(404).json({ error: 'Counsellor profile not found' });
        }
        const booking = await Booking_1.default.findOne({
            _id: req.params.id,
            counsellorId: counsellorUserId
        })
            .populate('studentId', 'name email rollNumber collegeId')
            .populate('counsellorId', 'name email');
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json({ booking });
    }
    catch (error) {
        console.error('Get booking details error:', error);
        res.status(500).json({ error: 'Failed to fetch booking details' });
    }
});
router.patch('/bookings/:id/complete', auth_1.authenticateToken, auth_1.requireCounsellor, async (req, res) => {
    try {
        const counsellorUserId = await getCounsellorUserId(req.user.id);
        if (!counsellorUserId) {
            return res.status(404).json({ error: 'Counsellor profile not found' });
        }
        const { sessionSummary } = req.body;
        const booking = await Booking_1.default.findOne({
            _id: req.params.id,
            counsellorId: counsellorUserId,
            status: 'confirmed'
        }).populate('studentId', 'name email');
        if (!booking) {
            return res.status(404).json({ error: 'Confirmed booking not found' });
        }
        booking.status = 'completed';
        if (sessionSummary) {
            booking.sessionSummary = sessionSummary;
        }
        booking.actualEndTime = new Date();
        await booking.save();
        await notificationService_1.default.createBookingNotification(booking._id.toString(), counsellorUserId.toString(), booking.studentId._id.toString(), 'completed');
        res.json({
            message: 'Booking completed successfully',
            booking,
        });
    }
    catch (error) {
        console.error('Complete booking error:', error);
        res.status(500).json({ error: 'Failed to complete booking' });
    }
});
router.patch('/bookings/:id/no-show', auth_1.authenticateToken, auth_1.requireCounsellor, async (req, res) => {
    try {
        const counsellorUserId = await getCounsellorUserId(req.user.id);
        if (!counsellorUserId) {
            return res.status(404).json({ error: 'Counsellor profile not found' });
        }
        const { reason } = req.body;
        const booking = await Booking_1.default.findOne({
            _id: req.params.id,
            counsellorId: counsellorUserId,
            status: 'confirmed'
        }).populate('studentId', 'name email');
        if (!booking) {
            return res.status(404).json({ error: 'Confirmed booking not found' });
        }
        booking.status = 'no_show';
        booking.isNoShow = true;
        if (reason) {
            booking.cancellationReason = reason;
        }
        await booking.save();
        await notificationService_1.default.createBookingNotification(booking._id.toString(), counsellorUserId.toString(), booking.studentId._id.toString(), 'no_show');
        res.json({
            message: 'Booking marked as no-show successfully',
            booking,
        });
    }
    catch (error) {
        console.error('No-show booking error:', error);
        res.status(500).json({ error: 'Failed to mark booking as no-show' });
    }
});
router.patch('/bookings/:id/reschedule', auth_1.authenticateToken, auth_1.requireCounsellor, async (req, res) => {
    try {
        const counsellorUserId = await getCounsellorUserId(req.user.id);
        if (!counsellorUserId) {
            return res.status(404).json({ error: 'Counsellor profile not found' });
        }
        const { newSlotStart, newSlotEnd, reason } = req.body;
        const booking = await Booking_1.default.findOne({
            _id: req.params.id,
            counsellorId: counsellorUserId,
            status: { $in: ['confirmed', 'pending'] }
        }).populate('studentId', 'name email');
        if (!booking) {
            return res.status(404).json({ error: 'Bookable booking not found' });
        }
        booking.slotStart = new Date(newSlotStart);
        booking.slotEnd = new Date(newSlotEnd);
        booking.status = 'rescheduled';
        if (reason) {
            booking.rescheduleReason = reason;
        }
        await booking.save();
        await notificationService_1.default.createBookingNotification(booking._id.toString(), counsellorUserId.toString(), booking.studentId._id.toString(), 'rescheduled');
        res.json({
            message: 'Booking rescheduled successfully',
            booking,
        });
    }
    catch (error) {
        console.error('Reschedule booking error:', error);
        res.status(500).json({ error: 'Failed to reschedule booking' });
    }
});
exports.default = router;
//# sourceMappingURL=counsellorExtended.js.map