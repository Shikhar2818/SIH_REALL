"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUsers = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const seedUsers = async () => {
    try {
        console.log('Starting user seeding...');
        const existingUsers = await User_1.default.find({
            email: { $in: ['student@test.com', 'admin@test.com', 'sarah@counsellor.com', 'amaan@counsellor.com', 'monis@counsellor.com'] }
        });
        if (existingUsers.length > 0) {
            console.log('Sample users already exist, skipping user seed');
            return;
        }
        const sampleUsers = [
            {
                name: 'John Student',
                email: 'student@test.com',
                password: 'password123',
                role: 'student',
                rollNumber: 'CS2023001',
                collegeId: 'COLLEGE001',
                consent: true,
            },
            {
                name: 'Admin User',
                email: 'admin@test.com',
                password: 'admin123',
                role: 'admin',
                consent: true,
            },
            {
                name: 'Dr. Sarah Johnson',
                email: 'sarah@counsellor.com',
                password: 'sarah123',
                role: 'counsellor',
                consent: true,
            },
            {
                name: 'Dr. Amaan Ahmed',
                email: 'amaan@counsellor.com',
                password: 'amaan123',
                role: 'counsellor',
                consent: true,
            },
            {
                name: 'Dr. Monis Kumar',
                email: 'monis@counsellor.com',
                password: 'monis123',
                role: 'counsellor',
                consent: true,
            },
        ];
        for (const userData of sampleUsers) {
            const hashedPassword = await bcryptjs_1.default.hash(userData.password, 12);
            const user = new User_1.default({
                name: userData.name,
                email: userData.email,
                hashedPassword,
                role: userData.role,
                rollNumber: userData.rollNumber,
                collegeId: userData.collegeId,
                consent: userData.consent,
                isActive: true,
            });
            await user.save();
            console.log(`✓ Created ${userData.role}: ${userData.email}`);
        }
        console.log('Sample users created successfully!');
        console.log('\n=== SAMPLE LOGIN CREDENTIALS ===');
        console.log('STUDENT:');
        console.log('  Email: student@test.com');
        console.log('  Password: password123');
        console.log('  Role: Student');
        console.log('');
        console.log('ADMIN:');
        console.log('  Email: admin@test.com');
        console.log('  Password: admin123');
        console.log('  Role: Admin');
        console.log('');
        console.log('COUNSELLOR:');
        console.log('  Email: counsellor@test.com');
        console.log('  Password: counsellor123');
        console.log('  Role: Counsellor');
        console.log('================================');
    }
    catch (error) {
        console.error('Error seeding users:', error);
        throw error;
    }
};
exports.seedUsers = seedUsers;
if (require.main === module) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
    mongoose_1.default.connect(mongoUri)
        .then(() => (0, exports.seedUsers)())
        .then(() => {
        console.log('User seeding completed');
        process.exit(0);
    })
        .catch((error) => {
        console.error('User seeding failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=seedUsers.js.map