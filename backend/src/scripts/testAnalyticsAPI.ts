import mongoose from 'mongoose';
import User from '../models/User';
import Booking from '../models/Booking';
import Screening from '../models/Screening';
import ForumPost from '../models/ForumPost';

const testAnalyticsAPI = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if we have data
    const userCount = await User.countDocuments();
    const bookingCount = await Booking.countDocuments();
    const screeningCount = await Screening.countDocuments();
    const postCount = await ForumPost.countDocuments();

    console.log(`\n📊 Database Statistics:`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Bookings: ${bookingCount}`);
    console.log(`   Screenings: ${screeningCount}`);
    console.log(`   Forum Posts: ${postCount}`);

    if (userCount === 0) {
      console.log('\n❌ No users found. Please run seedUsers.ts first.');
      return;
    }

    if (bookingCount === 0) {
      console.log('\n❌ No bookings found. Please run generateAnalyticsData.ts first.');
      return;
    }

    // Test the analytics query
    console.log('\n🧪 Testing analytics queries...');

    // User statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          }
        }
      }
    ]);
    console.log('✅ User stats query successful:', userStats);

    // Booking statistics
    const bookingStats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    console.log('✅ Booking stats query successful:', bookingStats);

    // Recent bookings
    const recentBookings = await Booking.find({})
      .populate('studentId', 'name email')
      .populate('counsellorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);
    console.log('✅ Recent bookings query successful:', recentBookings.length, 'bookings found');

    console.log('\n🎉 All analytics queries are working!');
    console.log('The issue might be with authentication or API routing.');

  } catch (error) {
    console.error('❌ Error testing analytics API:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

testAnalyticsAPI();
