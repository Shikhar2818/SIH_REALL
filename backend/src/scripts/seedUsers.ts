import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Counsellor from '../models/Counsellor';

export const seedUsers = async (): Promise<void> => {
  try {
    console.log('Starting user seeding...');

    // Check if users already exist
    const existingUsers = await User.find({
      email: { $in: ['student@test.com', 'admin@test.com', 'sarah@counsellor.com', 'amaan@counsellor.com', 'monis@counsellor.com'] }
    });

    if (existingUsers.length > 0) {
      console.log('Sample users already exist, skipping user seed');
      return;
    }

    // Create sample users
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
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const user = new User({
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

  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
  
  mongoose.connect(mongoUri)
    .then(() => seedUsers())
    .then(() => {
      console.log('User seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('User seeding failed:', error);
      process.exit(1);
    });
}
