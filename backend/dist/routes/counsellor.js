"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Booking_1 = __importDefault(require("../models/Booking"));
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
router.get('/bookings', auth_1.authenticateToken, auth_1.requireCounsellor, async (req, res) => {
    try {
        const bookings = await Booking_1.default.find({ counsellorId: req.user.id })
            .populate('studentId', 'name email rollNumber')
            .sort({ slotStart: -1 });
        res.json({ bookings });
    }
    catch (error) {
        console.error('Get counsellor bookings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.patch('/bookings/:id/status', auth_1.authenticateToken, auth_1.requireCounsellor, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const booking = await Booking_1.default.findOne({
            _id: req.params.id,
            counsellorId: req.user.id,
        });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        booking.status = status;
        await booking.save();
        res.json({
            message: 'Booking status updated successfully',
            booking: {
                id: booking._id,
                status: booking.status,
                updatedAt: booking.updatedAt,
            },
        });
    }
    catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/profile', auth_1.authenticateToken, auth_1.requireCounsellor, async (req, res) => {
    try {
        const counsellor = await User_1.default.findById(req.user.id).select('-hashedPassword');
        if (!counsellor) {
            return res.status(404).json({ error: 'Counsellor not found' });
        }
        res.json({ counsellor });
    }
    catch (error) {
        console.error('Get counsellor profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.patch('/profile', auth_1.authenticateToken, auth_1.requireCounsellor, async (req, res) => {
    try {
        const { name, languages, availabilitySlots } = req.body;
        const counsellor = await User_1.default.findById(req.user.id);
        if (!counsellor) {
            return res.status(404).json({ error: 'Counsellor not found' });
        }
        if (name)
            counsellor.name = name;
        await counsellor.save();
        res.json({
            message: 'Profile updated successfully',
            counsellor: {
                id: counsellor._id,
                name: counsellor.name,
                email: counsellor.email,
                role: counsellor.role,
            },
        });
    }
    catch (error) {
        console.error('Update counsellor profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/stats', auth_1.authenticateToken, auth_1.requireCounsellor, async (req, res) => {
    try {
        const totalBookings = await Booking_1.default.countDocuments({ counsellorId: req.user.id });
        const pendingBookings = await Booking_1.default.countDocuments({
            counsellorId: req.user.id,
            status: 'pending'
        });
        const confirmedBookings = await Booking_1.default.countDocuments({
            counsellorId: req.user.id,
            status: 'confirmed'
        });
        const completedBookings = await Booking_1.default.countDocuments({
            counsellorId: req.user.id,
            status: 'completed'
        });
        const recentBookings = await Booking_1.default.countDocuments({
            counsellorId: req.user.id,
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        });
        res.json({
            bookings: {
                total: totalBookings,
                pending: pendingBookings,
                confirmed: confirmedBookings,
                completed: completedBookings,
                recent: recentBookings,
            },
        });
    }
    catch (error) {
        console.error('Get counsellor stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=counsellor.js.map