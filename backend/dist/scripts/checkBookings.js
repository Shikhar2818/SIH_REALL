"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBookings = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Booking_1 = __importDefault(require("../models/Booking"));
const User_1 = __importDefault(require("../models/User"));
const Counsellor_1 = __importDefault(require("../models/Counsellor"));
const checkBookings = async () => {
    try {
        console.log('=== CURRENT BOOKINGS ===');
        const bookings = await Booking_1.default.find({}).populate('studentId', 'name email').populate('counsellorId', 'name email');
        console.log('Total bookings:', bookings.length);
        bookings.forEach(b => {
            const student = b.studentId;
            const counsellor = b.counsellorId;
            console.log('Booking ID:', b._id);
            console.log('  Student:', student?.name, '(' + student?.email + ')');
            console.log('  Counsellor:', counsellor?.name, '(' + counsellor?.email + ')');
            console.log('  Status:', b.status);
            console.log('  Date:', b.slotStart);
            console.log('---');
        });
        console.log('\n=== COUNSELLOR PROFILES ===');
        const counsellors = await Counsellor_1.default.find({});
        counsellors.forEach(c => console.log('Counsellor ID:', c._id, 'Name:', c.name, 'Email:', c.email));
        console.log('\n=== USER ACCOUNTS ===');
        const users = await User_1.default.find({ role: 'counsellor' });
        users.forEach(u => console.log('User ID:', u._id, 'Name:', u.name, 'Email:', u.email));
    }
    catch (error) {
        console.error('Error checking bookings:', error);
        throw error;
    }
};
exports.checkBookings = checkBookings;
if (require.main === module) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
    mongoose_1.default.connect(mongoUri)
        .then(() => (0, exports.checkBookings)())
        .then(() => {
        console.log('Booking check completed');
        process.exit(0);
    })
        .catch((error) => {
        console.error('Failed to check bookings:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=checkBookings.js.map