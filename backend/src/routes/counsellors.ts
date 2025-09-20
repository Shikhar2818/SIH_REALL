import express from 'express';
import Counsellor from '../models/Counsellor';
import Booking from '../models/Booking';

const router = express.Router();

// Get all counsellors
router.get('/', async (req, res) => {
  try {
    const counsellors = await Counsellor.find({ verified: true })
      .select('name email languages availabilitySlots')
      .sort({ name: 1 });

    res.json({ counsellors });
  } catch (error) {
    console.error('Get counsellors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get counsellor by ID
router.get('/:id', async (req, res) => {
  try {
    const counsellor = await Counsellor.findById(req.params.id)
      .select('name email languages availabilitySlots');

    if (!counsellor) {
      return res.status(404).json({ error: 'Counsellor not found' });
    }

    res.json({ counsellor });
  } catch (error) {
    console.error('Get counsellor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get counsellor availability for a specific date
router.get('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter required' });
    }

    const targetDate = new Date(date as string);
    const dayOfWeek = targetDate.getDay();

    const counsellor = await Counsellor.findById(id);
    if (!counsellor) {
      return res.status(404).json({ error: 'Counsellor not found' });
    }

    // Get counsellor's availability for this day
    const dayAvailability = counsellor.availabilitySlots.filter(
      slot => slot.dayOfWeek === dayOfWeek
    );

    // Get existing bookings for this date
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      counsellorId: id,
      status: { $in: ['pending', 'confirmed'] },
      slotStart: { $gte: startOfDay, $lte: endOfDay },
    }).select('slotStart slotEnd');

    // Generate available time slots
    const availableSlots = [];
    const slotDuration = 60; // 60 minutes per slot

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

        // Check if this slot conflicts with existing bookings
        const hasConflict = existingBookings.some(booking => {
          return (
            (currentTime >= booking.slotStart && currentTime < booking.slotEnd) ||
            (slotEnd > booking.slotStart && slotEnd <= booking.slotEnd) ||
            (currentTime <= booking.slotStart && slotEnd >= booking.slotEnd)
          );
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
  } catch (error) {
    console.error('Get counsellor availability error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
