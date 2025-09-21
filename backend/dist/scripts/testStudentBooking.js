"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testStudentBooking = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Booking_1 = __importDefault(require("../models/Booking"));
const User_1 = __importDefault(require("../models/User"));
const Counsellor_1 = __importDefault(require("../models/Counsellor"));
const testStudentBooking = async () => {
    try {
        console.log('Testing student booking creation...');
        const student = await User_1.default.findOne({ email: 'student@test.com' });
        if (!student) {
            console.log('Student not found');
            return;
        }
        const counsellor = await Counsellor_1.default.findOne({ email: 'sarah@counsellor.com' });
        if (!counsellor) {
            console.log('Counsellor not found');
            return;
        }
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(14, 0, 0, 0);
        const booking = new Booking_1.default({
            studentId: student._id,
            counsellorId: counsellor._id,
            slotStart: tomorrow,
            slotEnd: new Date(tomorrow.getTime() + 60 * 60 * 1000),
            status: 'pending',
            notes: 'Test booking created by student - should appear in counsellor dashboard',
        });
        await booking.save();
        console.log('Test booking created:');
        console.log('- Student:', student.name, '(' + student.email + ')');
        console.log('- Counsellor:', counsellor.name, '(' + counsellor.email + ')');
        console.log('- Status: pending');
        console.log('- Date:', tomorrow.toLocaleString());
        console.log('- Booking ID:', booking._id);
        console.log('\nTesting counsellor API...');
        const counsellorUser = await User_1.default.findOne({ email: 'sarah@counsellor.com' });
        if (!counsellorUser) {
            console.log('Counsellor user account not found');
            return;
        }
        console.log('Counsellor user account found:', counsellorUser.name);
        console.log('Counsellor profile ID:', counsellor._id);
        console.log('Booking counsellor ID:', booking.counsellorId);
        console.log('IDs match:', counsellor._id.toString() === booking.counsellorId.toString());
    }
    catch (error) {
        console.error('Error testing student booking:', error);
        throw error;
    }
};
exports.testStudentBooking = testStudentBooking;
if (require.main === module) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
    mongoose_1.default.connect(mongoUri)
        .then(() => (0, exports.testStudentBooking)())
        .then(() => {
        console.log('Student booking test completed');
        process.exit(0);
    })
        .catch((error) => {
        console.error('Failed to test student booking:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=testStudentBooking.js.map