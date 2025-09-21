"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const Booking_1 = __importDefault(require("../models/Booking"));
const fixCounsellorReferences = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        const counsellors = await User_1.default.find({ role: 'counsellor' });
        console.log(`Found ${counsellors.length} counsellors`);
        if (counsellors.length === 0) {
            console.log('❌ No counsellors found. Please run seedUsers.ts first.');
            return;
        }
        const allBookings = await Booking_1.default.find({});
        console.log(`Found ${allBookings.length} bookings`);
        let updatedCount = 0;
        for (const booking of allBookings) {
            const isValidCounsellor = counsellors.some(c => c._id.toString() === booking.counsellorId.toString());
            if (!isValidCounsellor) {
                const randomCounsellor = counsellors[Math.floor(Math.random() * counsellors.length)];
                booking.counsellorId = randomCounsellor._id;
                await booking.save();
                updatedCount++;
            }
        }
        console.log(`✅ Updated ${updatedCount} bookings with valid counsellor references`);
        console.log('\n🧪 Testing Counsellor Stats Aggregation after fix:');
        const counsellorStats = await Booking_1.default.aggregate([
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
    }
    catch (error) {
        console.error('❌ Error fixing counsellor references:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};
fixCounsellorReferences();
//# sourceMappingURL=fixCounsellorReferences.js.map