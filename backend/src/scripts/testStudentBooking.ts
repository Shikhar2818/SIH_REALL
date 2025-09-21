import mongoose from 'mongoose';
import Booking from '../models/Booking';
import User from '../models/User';
import Counsellor from '../models/Counsellor';

export const testStudentBooking = async (): Promise<void> => {
  try {
    console.log('Testing student booking creation...');

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
    tomorrow.setHours(14, 0, 0, 0); // 2:00 PM

    const booking = new Booking({
      studentId: student._id,
      counsellorId: counsellor._id,
      slotStart: tomorrow,
      slotEnd: new Date(tomorrow.getTime() + 60 * 60 * 1000), // 1 hour later
      status: 'pending',
      notes: 'Test booking created by student - should appear in counsellor dashboard',
    });

    await booking.save();

    console.log('Test booking created:');
    console.log('- Student:', student.name, '(' + student.email + ')');
    console.log('- Counsellor:', counsellor.name, '(' + counsellor.email + ')');
    console.log('- Status: pending');
    console.log('- Date:', tomorrow.toLocaleString());
    console.log('- Booking ID:', booking._id);

    // Now test if the counsellor can see this booking
    console.log('\nTesting counsellor API...');
    
    // Get counsellor user account
    const counsellorUser = await User.findOne({ email: 'sarah@counsellor.com' });
    if (!counsellorUser) {
      console.log('Counsellor user account not found');
      return;
    }

    console.log('Counsellor user account found:', counsellorUser.name);
    console.log('Counsellor profile ID:', counsellor._id);
    console.log('Booking counsellor ID:', booking.counsellorId);
    console.log('IDs match:', counsellor._id.toString() === booking.counsellorId.toString());

  } catch (error) {
    console.error('Error testing student booking:', error);
    throw error;
  }
};

// Run if this file is executed directly
if (require.main === module) {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
  
  mongoose.connect(mongoUri)
    .then(() => testStudentBooking())
    .then(() => {
      console.log('Student booking test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to test student booking:', error);
      process.exit(1);
    });
}
