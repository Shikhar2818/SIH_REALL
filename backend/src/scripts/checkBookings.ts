import mongoose from 'mongoose';
import Booking from '../models/Booking';
import User from '../models/User';
import Counsellor from '../models/Counsellor';

export const checkBookings = async (): Promise<void> => {
  try {
    console.log('=== CURRENT BOOKINGS ===');
    const bookings = await Booking.find({}).populate('studentId', 'name email').populate('counsellorId', 'name email');
    console.log('Total bookings:', bookings.length);
    
    bookings.forEach(b => {
      const student = b.studentId as any;
      const counsellor = b.counsellorId as any;
      console.log('Booking ID:', b._id);
      console.log('  Student:', student?.name, '(' + student?.email + ')');
      console.log('  Counsellor:', counsellor?.name, '(' + counsellor?.email + ')');
      console.log('  Status:', b.status);
      console.log('  Date:', b.slotStart);
      console.log('---');
    });

    console.log('\n=== COUNSELLOR PROFILES ===');
    const counsellors = await Counsellor.find({});
    counsellors.forEach(c => console.log('Counsellor ID:', c._id, 'Name:', c.name, 'Email:', c.email));

    console.log('\n=== USER ACCOUNTS ===');
    const users = await User.find({ role: 'counsellor' });
    users.forEach(u => console.log('User ID:', u._id, 'Name:', u.name, 'Email:', u.email));

  } catch (error) {
    console.error('Error checking bookings:', error);
    throw error;
  }
};

// Run if this file is executed directly
if (require.main === module) {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
  
  mongoose.connect(mongoUri)
    .then(() => checkBookings())
    .then(() => {
      console.log('Booking check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to check bookings:', error);
      process.exit(1);
    });
}
