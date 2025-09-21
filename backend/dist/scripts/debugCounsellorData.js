"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const Booking_1 = __importDefault(require("../models/Booking"));
const debugCounsellorData = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        console.log('\n👥 Counsellor Users:');
        const counsellors = await User_1.default.find({ role: 'counsellor' });
        console.log(`   Found ${counsellors.length} counsellors`);
        counsellors.forEach((counsellor, index) => {
            console.log(`   ${index + 1}. ${counsellor.name} (${counsellor.email}) - ID: ${counsellor._id}`);
        });
        console.log('\n📅 Counsellor IDs in Bookings:');
        const uniqueCounsellorIds = await Booking_1.default.distinct('counsellorId');
        console.log(`   Found ${uniqueCounsellorIds.length} unique counsellor IDs in bookings`);
        uniqueCounsellorIds.forEach((id, index) => {
            console.log(`   ${index + 1}. ${id}`);
        });
        console.log('\n🔍 Matching Counsellor IDs:');
        const counsellorIds = counsellors.map(c => c._id.toString());
        const bookingCounsellorIds = uniqueCounsellorIds.map(id => id.toString());
        const matchingIds = counsellorIds.filter(id => bookingCounsellorIds.includes(id));
        const nonMatchingIds = bookingCounsellorIds.filter(id => !counsellorIds.includes(id));
        console.log(`   Matching IDs: ${matchingIds.length}`);
        matchingIds.forEach(id => console.log(`     ✅ ${id}`));
        console.log(`   Non-matching IDs: ${nonMatchingIds.length}`);
        nonMatchingIds.forEach(id => console.log(`     ❌ ${id}`));
        console.log('\n🧪 Testing Counsellor Stats Aggregation:');
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
                    totalBookings: { $sum: 1 }
                }
            }
        ]);
        console.log(`   Aggregation result: ${counsellorStats.length} counsellors`);
        counsellorStats.forEach(stat => {
            console.log(`     - ${stat.counsellorName}: ${stat.totalBookings} bookings`);
        });
    }
    catch (error) {
        console.error('❌ Error debugging counsellor data:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};
debugCounsellorData();
//# sourceMappingURL=debugCounsellorData.js.map