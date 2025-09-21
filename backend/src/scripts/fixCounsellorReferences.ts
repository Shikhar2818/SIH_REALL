import mongoose from 'mongoose';
import User from '../models/User';
import Booking from '../models/Booking';

const fixCounsellorReferences = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get all counsellors
    const counsellors = await User.find({ role: 'counsellor' });
    console.log(`Found ${counsellors.length} counsellors`);

    if (counsellors.length === 0) {
      console.log('❌ No counsellors found. Please run seedUsers.ts first.');
      return;
    }

    // Get all bookings with invalid counsellor references
    const allBookings = await Booking.find({});
    console.log(`Found ${allBookings.length} bookings`);

    // Update bookings to use valid counsellor IDs
    let updatedCount = 0;
    for (const booking of allBookings) {
      // Check if the current counsellorId is valid
      const isValidCounsellor = counsellors.some(c => c._id.toString() === booking.counsellorId.toString());
      
      if (!isValidCounsellor) {
        // Assign a random valid counsellor
        const randomCounsellor = counsellors[Math.floor(Math.random() * counsellors.length)];
        booking.counsellorId = randomCounsellor._id as mongoose.Types.ObjectId;
        await booking.save();
        updatedCount++;
      }
    }

    console.log(`✅ Updated ${updatedCount} bookings with valid counsellor references`);

    // Test the aggregation query again
    console.log('\n🧪 Testing Counsellor Stats Aggregation after fix:');
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
          totalBookings: { $sum: 1 },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          noShows: {
            $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] }
          }
        }
      },
      {
        $addFields: {
          confirmationRate: {
            $multiply: [
              { $divide: ['$confirmedBookings', '$totalBookings'] },
              100
            ]
          },
          completionRate: {
            $multiply: [
              { $divide: ['$completedBookings', '$confirmedBookings'] },
              100
            ]
          }
        }
      }
    ]);

    console.log(`   Aggregation result: ${counsellorStats.length} counsellors`);
    counsellorStats.forEach(stat => {
      console.log(`     - ${stat.counsellorName}: ${stat.totalBookings} total, ${stat.confirmedBookings} confirmed, ${stat.completedBookings} completed`);
      console.log(`       Confirmation Rate: ${stat.confirmationRate?.toFixed(1)}%, Completion Rate: ${stat.completionRate?.toFixed(1)}%`);
    });

  } catch (error) {
    console.error('❌ Error fixing counsellor references:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

fixCounsellorReferences();
