"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewBooking = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Booking_1 = __importDefault(require("../models/Booking"));
const User_1 = __importDefault(require("../models/User"));
const Counsellor_1 = __importDefault(require("../models/Counsellor"));
const createNewBooking = async () => {
    try {
        console.log('Creating a new test booking...');
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
        tomorrow.setHours(10, 0, 0, 0);
        const booking = new Booking_1.default({
            studentId: student._id,
            counsellorId: counsellor._id,
            slotStart: tomorrow,
            slotEnd: new Date(tomorrow.getTime() + 60 * 60 * 1000),
            status: 'pending',
            notes: 'New test booking created by student - needs counsellor approval',
        });
        await booking.save();
        console.log('New booking created:');
        console.log('- Student:', student.name);
        console.log('- Counsellor:', counsellor.name);
        console.log('- Status: pending');
        console.log('- Date:', tomorrow.toLocaleString());
        console.log('- Booking ID:', booking._id);
    }
    catch (error) {
        console.error('Error creating new booking:', error);
        throw error;
    }
};
exports.createNewBooking = createNewBooking;
if (require.main === module) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
    mongoose_1.default.connect(mongoUri)
        .then(() => (0, exports.createNewBooking)())
        .then(() => {
        console.log('New booking created successfully');
        process.exit(0);
    })
        .catch((error) => {
        console.error('Failed to create new booking:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=createNewBooking.js.map