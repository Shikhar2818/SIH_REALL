import mongoose from 'mongoose';
import User from '../models/User';
import Booking from '../models/Booking';

const fixStudentReferences = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get all students
    const students = await User.find({ role: 'student' });
    console.log(`Found ${students.length} students`);

    if (students.length === 0) {
      console.log('❌ No students found. Please run seedUsers.ts first.');
      return;
    }

    // Get all bookings with invalid student references
    const allBookings = await Booking.find({});
    console.log(`Found ${allBookings.length} bookings`);

    // Update bookings to use valid student IDs
    let updatedCount = 0;
    for (const booking of allBookings) {
      // Check if the current studentId is valid
      const isValidStudent = students.some(s => s._id.toString() === booking.studentId.toString());
      
      if (!isValidStudent) {
        // Assign a random valid student
        const randomStudent = students[Math.floor(Math.random() * students.length)];
        booking.studentId = randomStudent._id as mongoose.Types.ObjectId;
        await booking.save();
        updatedCount++;
      }
    }

    console.log(`✅ Updated ${updatedCount} bookings with valid student references`);

    // Test recent bookings
    console.log('\n🧪 Testing Recent Bookings after fix:');
    const recentBookings = await Booking.find({})
      .populate('studentId', 'name email')
      .populate('counsellorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    recentBookings.forEach((booking, index) => {
      console.log(`   Booking ${index + 1}:`);
      console.log(`     Student: ${(booking.studentId as any)?.name || 'null'}`);
      console.log(`     Counsellor: ${(booking.counsellorId as any)?.name || 'null'}`);
      console.log(`     Status: ${booking.status}`);
    });

  } catch (error) {
    console.error('❌ Error fixing student references:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

fixStudentReferences();
