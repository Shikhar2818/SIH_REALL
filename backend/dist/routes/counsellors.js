"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Counsellor_1 = __importDefault(require("../models/Counsellor"));
const Booking_1 = __importDefault(require("../models/Booking"));
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const counsellors = await Counsellor_1.default.find({ verified: true })
            .select('name email languages availabilitySlots')
            .sort({ name: 1 });
        res.json({ counsellors });
    }
    catch (error) {
        console.error('Get counsellors error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const counsellor = await Counsellor_1.default.findById(req.params.id)
            .select('name email languages availabilitySlots');
        if (!counsellor) {
            return res.status(404).json({ error: 'Counsellor not found' });
        }
        res.json({ counsellor });
    }
    catch (error) {
        console.error('Get counsellor error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:id/availability', async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ error: 'Date parameter required' });
        }
        const targetDate = new Date(date);
        const dayOfWeek = targetDate.getDay();
        const counsellor = await Counsellor_1.default.findById(id);
        if (!counsellor) {
            return res.status(404).json({ error: 'Counsellor not found' });
        }
        const dayAvailability = counsellor.availabilitySlots.filter(slot => slot.dayOfWeek === dayOfWeek);
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        const existingBookings = await Booking_1.default.find({
            counsellorId: id,
            status: { $in: ['pending', 'confirmed'] },
            slotStart: { $gte: startOfDay, $lte: endOfDay },
        }).select('slotStart slotEnd');
        const availableSlots = [];
        const slotDuration = 60;
        for (const availability of dayAvailability) {
            const [startHour, startMinute] = availability.startTime.split(':').map(Number);
            const [endHour, endMinute] = availability.endTime.split(':').map(Number);
            const startTime = new Date(targetDate);
            startTime.setHours(startHour, startMinute, 0, 0);
            const endTime = new Date(targetDate);
            endTime.setHours(endHour, endMinute, 0, 0);
            let currentTime = new Date(startTime);
            while (currentTime < endTime) {
                const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);
                const hasConflict = existingBookings.some(booking => {
                    return ((currentTime >= booking.slotStart && currentTime < booking.slotEnd) ||
                        (slotEnd > booking.slotStart && slotEnd <= booking.slotEnd) ||
                        (currentTime <= booking.slotStart && slotEnd >= booking.slotEnd));
                });
                if (!hasConflict && slotEnd <= endTime) {
                    availableSlots.push({
                        start: new Date(currentTime),
                        end: new Date(slotEnd),
                    });
                }
                currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
            }
        }
        res.json({
            counsellor: {
                id: counsellor._id,
                name: counsellor.name,
            },
            date: targetDate,
            availableSlots,
        });
    }
    catch (error) {
        console.error('Get counsellor availability error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=counsellors.js.map