import mongoose from 'mongoose';
import User from '../models/User';
import Booking from '../models/Booking';

const debugCounsellorData = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check users with counsellor role
    console.log('\n👥 Counsellor Users:');
    const counsellors = await User.find({ role: 'counsellor' });
    console.log(`   Found ${counsellors.length} counsellors`);
    
    counsellors.forEach((counsellor, index) => {
      console.log(`   ${index + 1}. ${counsellor.name} (${counsellor.email}) - ID: ${counsellor._id}`);
    });

    // Check unique counsellor IDs in bookings
    console.log('\n📅 Counsellor IDs in Bookings:');
    const uniqueCounsellorIds = await Booking.distinct('counsellorId');
    console.log(`   Found ${uniqueCounsellorIds.length} unique counsellor IDs in bookings`);
    
    uniqueCounsellorIds.forEach((id, index) => {
      console.log(`   ${index + 1}. ${id}`);
    });

    // Check if counsellor IDs in bookings match user IDs
    console.log('\n🔍 Matching Counsellor IDs:');
    const counsellorIds = counsellors.map(c => c._id.toString());
    const bookingCounsellorIds = uniqueCounsellorIds.map(id => id.toString());
    
    const matchingIds = counsellorIds.filter(id => bookingCounsellorIds.includes(id));
    const nonMatchingIds = bookingCounsellorIds.filter(id => !counsellorIds.includes(id));
    
    console.log(`   Matching IDs: ${matchingIds.length}`);
    matchingIds.forEach(id => console.log(`     ✅ ${id}`));
    
    console.log(`   Non-matching IDs: ${nonMatchingIds.length}`);
    nonMatchingIds.forEach(id => console.log(`     ❌ ${id}`));

    // Test the aggregation query
    console.log('\n🧪 Testing Counsellor Stats Aggregation:');
    const counsellorStats = await Booking.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'counsellorId',
          foreignField: '_id',
          as: 'counsellor'
        }
      },
      {
        $unwind: '$counsellor'
      },
      {
        $group: {
          _id: '$counsellorId',
          counsellorName: { $first: '$counsellor.name' },
          totalBookings: { $sum: 1 }
        }
      }
    ]);

    console.log(`   Aggregation result: ${counsellorStats.length} counsellors`);
    counsellorStats.forEach(stat => {
      console.log(`     - ${stat.counsellorName}: ${stat.totalBookings} bookings`);
    });

  } catch (error) {
    console.error('❌ Error debugging counsellor data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

debugCounsellorData();
