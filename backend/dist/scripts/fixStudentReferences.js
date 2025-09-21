"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const Booking_1 = __importDefault(require("../models/Booking"));
const fixStudentReferences = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        const students = await User_1.default.find({ role: 'student' });
        console.log(`Found ${students.length} students`);
        if (students.length === 0) {
            console.log('❌ No students found. Please run seedUsers.ts first.');
            return;
        }
        const allBookings = await Booking_1.default.find({});
        console.log(`Found ${allBookings.length} bookings`);
        let updatedCount = 0;
        for (const booking of allBookings) {
            const isValidStudent = students.some(s => s._id.toString() === booking.studentId.toString());
            if (!isValidStudent) {
                const randomStudent = students[Math.floor(Math.random() * students.length)];
                booking.studentId = randomStudent._id;
                await booking.save();
                updatedCount++;
            }
        }
        console.log(`✅ Updated ${updatedCount} bookings with valid student references`);
        console.log('\n🧪 Testing Recent Bookings after fix:');
        const recentBookings = await Booking_1.default.find({})
            .populate('studentId', 'name email')
            .populate('counsellorId', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);
        recentBookings.forEach((booking, index) => {
            console.log(`   Booking ${index + 1}:`);
            console.log(`     Student: ${booking.studentId?.name || 'null'}`);
            console.log(`     Counsellor: ${booking.counsellorId?.name || 'null'}`);
            console.log(`     Status: ${booking.status}`);
        });
    }
    catch (error) {
        console.error('❌ Error fixing student references:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};
fixStudentReferences();
//# sourceMappingURL=fixStudentReferences.js.map