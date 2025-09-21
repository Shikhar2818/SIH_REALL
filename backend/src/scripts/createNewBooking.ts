import mongoose from 'mongoose';
import Booking from '../models/Booking';
import User from '../models/User';
import Counsellor from '../models/Counsellor';

export const createNewBooking = async (): Promise<void> => {
  try {
    console.log('Creating a new test booking...');

    // Get the student
    const student = await User.findOne({ email: 'student@test.com' });
    if (!student) {
      console.log('Student not found');
      return;
    }

    // Get Dr. Sarah counsellor profile
    const counsellor = await Counsellor.findOne({ email: 'sarah@counsellor.com' });
    if (!counsellor) {
      console.log('Counsellor not found');
      return;
    }

    // Create a new booking for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // 10:00 AM

    const booking = new Booking({
      studentId: student._id,
      counsellorId: counsellor._id,
      slotStart: tomorrow,
      slotEnd: new Date(tomorrow.getTime() + 60 * 60 * 1000), // 1 hour later
      status: 'pending',
      notes: 'New test booking created by student - needs counsellor approval',
    });

    await booking.save();

    console.log('New booking created:');
    console.log('- Student:', student.name);
    console.log('- Counsellor:', counsellor.name);
    console.log('- Status: pending');
    console.log('- Date:', tomorrow.toLocaleString());
    console.log('- Booking ID:', booking._id);

  } catch (error) {
    console.error('Error creating new booking:', error);
    throw error;
  }
};

// Run if this file is executed directly
if (require.main === module) {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
  
  mongoose.connect(mongoUri)
    .then(() => createNewBooking())
    .then(() => {
      console.log('New booking created successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create new booking:', error);
      process.exit(1);
    });
}
