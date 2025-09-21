import mongoose from 'mongoose';
import Booking from '../models/Booking';
import User from '../models/User';
import Counsellor from '../models/Counsellor';

export const createTestBookings = async (): Promise<void> => {
  try {
    console.log('Creating test bookings...');

    // Get the student and counsellors
    const student = await User.findOne({ email: 'student@test.com' });
    const counsellors = await User.find({ role: 'counsellor' });
    
    if (!student) {
      console.log('Student not found, skipping test bookings');
      return;
    }

    if (counsellors.length === 0) {
      console.log('No counsellors found, skipping test bookings');
      return;
    }

    // Clear existing bookings
    await Booking.deleteMany({});

    // Create test bookings for each counsellor
    const testBookings = [];
    
    for (let i = 0; i < counsellors.length; i++) {
      const counsellor = counsellors[i];
      const counsellorProfile = await Counsellor.findOne({ email: counsellor.email });
      
      if (counsellorProfile) {
        // Create bookings for different statuses
        const now = new Date();
        
        // Pending booking (tomorrow)
        const pendingBooking = new Booking({
          studentId: student._id,
          counsellorId: counsellorProfile._id,
          slotStart: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
          slotEnd: new Date(now.getTime() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour later
          status: 'pending',
          notes: `Test booking with ${counsellor.name} - pending approval`,
        });

        // Confirmed booking (day after tomorrow)
        const confirmedBooking = new Booking({
          studentId: student._id,
          counsellorId: counsellorProfile._id,
          slotStart: new Date(now.getTime() + 48 * 60 * 60 * 1000), // Day after tomorrow
          slotEnd: new Date(now.getTime() + 48 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour later
          status: 'confirmed',
          notes: `Test booking with ${counsellor.name} - confirmed`,
        });

        testBookings.push(pendingBooking, confirmedBooking);
      }
    }

    // Save all bookings
    await Booking.insertMany(testBookings);
    
    console.log(`Created ${testBookings.length} test bookings`);
    
    // Display the created bookings
    const allBookings = await Booking.find({})
      .populate('studentId', 'name email')
      .populate('counsellorId', 'name email');
    
    console.log('\nCreated bookings:');
    allBookings.forEach(booking => {
      const student = booking.studentId as any;
      const counsellor = booking.counsellorId as any;
      console.log(`- ${student?.name} -> ${counsellor?.name} (${booking.status})`);
    });

  } catch (error) {
    console.error('Error creating test bookings:', error);
    throw error;
  }
};

// Run if this file is executed directly
if (require.main === module) {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
  
  mongoose.connect(mongoUri)
    .then(() => createTestBookings())
    .then(() => {
      console.log('Test bookings created successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed to create test bookings:', error);
      process.exit(1);
    });
}
