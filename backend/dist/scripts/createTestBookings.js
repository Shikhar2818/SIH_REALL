"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestBookings = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Booking_1 = __importDefault(require("../models/Booking"));
const User_1 = __importDefault(require("../models/User"));
const Counsellor_1 = __importDefault(require("../models/Counsellor"));
const createTestBookings = async () => {
    try {
        console.log('Creating test bookings...');
        const student = await User_1.default.findOne({ email: 'student@test.com' });
        const counsellors = await User_1.default.find({ role: 'counsellor' });
        if (!student) {
            console.log('Student not found, skipping test bookings');
            return;
        }
        if (counsellors.length === 0) {
            console.log('No counsellors found, skipping test bookings');
            return;
        }
        await Booking_1.default.deleteMany({});
        const testBookings = [];
        for (let i = 0; i < counsellors.length; i++) {
            const counsellor = counsellors[i];
            const counsellorProfile = await Counsellor_1.default.findOne({ email: counsellor.email });
            if (counsellorProfile) {
                const now = new Date();
                const pendingBooking = new Booking_1.default({
                    studentId: student._id,
                    counsellorId: counsellorProfile._id,
                    slotStart: new Date(now.getTime() + 24 * 60 * 60 * 1000),
                    slotEnd: new Date(now.getTime() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
                    status: 'pending',
                    notes: `Test booking with ${counsellor.name} - pending approval`,
                });
                const confirmedBooking = new Booking_1.default({
                    studentId: student._id,
                    counsellorId: counsellorProfile._id,
                    slotStart: new Date(now.getTime() + 48 * 60 * 60 * 1000),
                    slotEnd: new Date(now.getTime() + 48 * 60 * 60 * 1000 + 60 * 60 * 1000),
                    status: 'confirmed',
                    notes: `Test booking with ${counsellor.name} - confirmed`,
                });
                testBookings.push(pendingBooking, confirmedBooking);
            }
        }
        await Booking_1.default.insertMany(testBookings);
        console.log(`Created ${testBookings.length} test bookings`);
        const allBookings = await Booking_1.default.find({})
            .populate('studentId', 'name email')
            .populate('counsellorId', 'name email');
        console.log('\nCreated bookings:');
        allBookings.forEach(booking => {
            const student = booking.studentId;
            const counsellor = booking.counsellorId;
            console.log(`- ${student?.name} -> ${counsellor?.name} (${booking.status})`);
        });
    }
    catch (error) {
        console.error('Error creating test bookings:', error);
        throw error;
    }
};
exports.createTestBookings = createTestBookings;
if (require.main === module) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
    mongoose_1.default.connect(mongoUri)
        .then(() => (0, exports.createTestBookings)())
        .then(() => {
        console.log('Test bookings created successfully');
        process.exit(0);
    })
        .catch((error) => {
        console.error('Failed to create test bookings:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=createTestBookings.js.map