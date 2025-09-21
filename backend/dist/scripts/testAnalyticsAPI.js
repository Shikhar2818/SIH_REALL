"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const Booking_1 = __importDefault(require("../models/Booking"));
const Screening_1 = __importDefault(require("../models/Screening"));
const ForumPost_1 = __importDefault(require("../models/ForumPost"));
const testAnalyticsAPI = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        const userCount = await User_1.default.countDocuments();
        const bookingCount = await Booking_1.default.countDocuments();
        const screeningCount = await Screening_1.default.countDocuments();
        const postCount = await ForumPost_1.default.countDocuments();
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
        console.log('\n🧪 Testing analytics queries...');
        const userStats = await User_1.default.aggregate([
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
        const bookingStats = await Booking_1.default.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        console.log('✅ Booking stats query successful:', bookingStats);
        const recentBookings = await Booking_1.default.find({})
            .populate('studentId', 'name email')
            .populate('counsellorId', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);
        console.log('✅ Recent bookings query successful:', recentBookings.length, 'bookings found');
        console.log('\n🎉 All analytics queries are working!');
        console.log('The issue might be with authentication or API routing.');
    }
    catch (error) {
        console.error('❌ Error testing analytics API:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
};
testAnalyticsAPI();
//# sourceMappingURL=testAnalyticsAPI.js.map