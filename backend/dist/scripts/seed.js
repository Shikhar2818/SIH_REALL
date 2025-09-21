"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Counsellor_1 = __importDefault(require("../models/Counsellor"));
const seedDatabase = async () => {
    try {
        console.log('Starting database seeding...');
        const existingCounsellors = await Counsellor_1.default.find({
            email: { $in: ['sarah@counsellor.com', 'amaan@counsellor.com', 'monis@counsellor.com'] }
        });
        if (existingCounsellors.length > 0) {
            console.log('Counsellors already exist, skipping seed');
            return;
        }
        const sarah = new Counsellor_1.default({
            name: 'Dr. Sarah Johnson',
            email: 'sarah@counsellor.com',
            verified: true,
            languages: ['English', 'Hindi'],
            availabilitySlots: [
                { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
                { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
                { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
                { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
                { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
            ],
        });
        const amaan = new Counsellor_1.default({
            name: 'Dr. Amaan Ahmed',
            email: 'amaan@counsellor.com',
            verified: true,
            languages: ['English', 'Hindi', 'Urdu'],
            availabilitySlots: [
                { dayOfWeek: 1, startTime: '10:00', endTime: '18:00' },
                { dayOfWeek: 2, startTime: '10:00', endTime: '18:00' },
                { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' },
                { dayOfWeek: 4, startTime: '10:00', endTime: '18:00' },
                { dayOfWeek: 5, startTime: '10:00', endTime: '18:00' },
                { dayOfWeek: 6, startTime: '09:00', endTime: '15:00' },
            ],
        });
        const monis = new Counsellor_1.default({
            name: 'Dr. Monis Kumar',
            email: 'monis@counsellor.com',
            verified: true,
            languages: ['English', 'Hindi', 'Tamil'],
            availabilitySlots: [
                { dayOfWeek: 1, startTime: '08:00', endTime: '16:00' },
                { dayOfWeek: 2, startTime: '08:00', endTime: '16:00' },
                { dayOfWeek: 3, startTime: '08:00', endTime: '16:00' },
                { dayOfWeek: 4, startTime: '08:00', endTime: '16:00' },
                { dayOfWeek: 5, startTime: '08:00', endTime: '16:00' },
                { dayOfWeek: 0, startTime: '10:00', endTime: '14:00' },
            ],
        });
        await Promise.all([sarah.save(), amaan.save(), monis.save()]);
        console.log('Database seeded successfully with Dr. Sarah, Dr. Amaan, and Dr. Monis counsellors');
    }
    catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
};
exports.seedDatabase = seedDatabase;
if (require.main === module) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
    mongoose_1.default.connect(mongoUri)
        .then(() => (0, exports.seedDatabase)())
        .then(() => {
        console.log('Seeding completed');
        process.exit(0);
    })
        .catch((error) => {
        console.error('Seeding failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=seed.js.map