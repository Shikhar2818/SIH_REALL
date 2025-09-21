"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const Booking_1 = __importDefault(require("../models/Booking"));
const Counsellor_1 = __importDefault(require("../models/Counsellor"));
const email_1 = require("../utils/email");
const auth_1 = require("../middleware/auth");
const notificationService_1 = __importDefault(require("../services/notificationService"));
const router = express_1.default.Router();
router.post('/', [
    auth_1.authenticateToken,
    (0, express_validator_1.body)('counsellorId').isMongoId().withMessage('Valid counsellor ID required'),
    (0, express_validator_1.body)('slotStart').isISO8601().withMessage('Valid start time required'),
    (0, express_validator_1.body)('slotEnd').isISO8601().withMessage('Valid end time required'),
    (0, express_validator_1.body)('notes').optional().trim(),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { counsellorId, slotStart, slotEnd, notes } = req.body;
        const startTime = new Date(slotStart);
        const endTime = new Date(slotEnd);
        if (startTime >= endTime) {
            return res.status(400).json({ error: 'Start time must be before end time' });
        }
        if (startTime <= new Date()) {
            return res.status(400).json({ error: 'Booking must be in the future' });
        }
        const counsellor = await Counsellor_1.default.findById(counsellorId);
        if (!counsellor) {
            return res.status(404).json({ error: 'Counsellor not found' });
        }
        const conflictingBooking = await Booking_1.default.findOne({
            counsellorId,
            status: { $in: ['pending', 'confirmed'] },
            $or: [
                {
                    slotStart: { $lt: endTime },
                    slotEnd: { $gt: startTime },
                },
            ],
        });
        if (conflictingBooking) {
            return res.status(400).json({ error: 'Time slot is not available' });
        }
        const booking = new Booking_1.default({
            studentId: req.user.id,
            counsellorId,
            slotStart: startTime,
            slotEnd: endTime,
            notes,
        });
        await booking.save();
        await notificationService_1.default.createBookingNotification(booking._id.toString(), counsellorId, req.user.id, 'booked');
        try {
            await (0, email_1.sendBookingNotification)(counsellor.email, req.user.name, startTime, endTime);
        }
        catch (emailError) {
            console.error('Failed to send booking notification:', emailError);
        }
        res.status(201).json({
            message: 'Booking created successfully',
            booking: {
                id: booking._id,
                counsellorId: booking.counsellorId,
                slotStart: booking.slotStart,
                slotEnd: booking.slotEnd,
                status: booking.status,
                notes: booking.notes,
                createdAt: booking.createdAt,
            },
        });
    }
    catch (error) {
        console.error('Booking creation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/my-bookings', auth_1.authenticateToken, async (req, res) => {
    try {
        const bookings = await Booking_1.default.find({ studentId: req.user.id })
            .populate('counsellorId', 'name email')
            .sort({ slotStart: -1 });
        res.json({ bookings });
    }
    catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.patch('/:id/status', [
    auth_1.authenticateToken,
    (0, express_validator_1.body)('status').isIn(['pending', 'confirmed', 'cancelled', 'completed'])
        .withMessage('Valid status required'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { id } = req.params;
        const { status } = req.body;
        const booking = await Booking_1.default.findById(id);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        booking.status = status;
        await booking.save();
        res.json({
            message: 'Booking status updated',
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
router.patch('/:id/cancel', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking_1.default.findOne({
            _id: id,
            studentId: req.user.id,
        });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        if (booking.status === 'cancelled') {
            return res.status(400).json({ error: 'Booking is already cancelled' });
        }
        if (booking.status === 'completed') {
            return res.status(400).json({ error: 'Cannot cancel completed booking' });
        }
        booking.status = 'cancelled';
        await booking.save();
        res.json({
            message: 'Booking cancelled successfully',
            booking: {
                id: booking._id,
                status: booking.status,
                updatedAt: booking.updatedAt,
            },
        });
    }
    catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=bookings.js.map