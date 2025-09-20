import mongoose from 'mongoose';
import Counsellor from '../models/Counsellor';

export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('Starting database seeding...');

    // Check if counsellors already exist
    const existingCounsellors = await Counsellor.find({
      email: { $in: ['sarah@counsellor.com', 'amaan@counsellor.com', 'monis@counsellor.com'] }
    });

    if (existingCounsellors.length > 0) {
      console.log('Counsellors already exist, skipping seed');
      return;
    }

    // Create Dr. Sarah Johnson counsellor
    const sarah = new Counsellor({
      name: 'Dr. Sarah Johnson',
      email: 'sarah@counsellor.com',
      verified: true,
      languages: ['English', 'Hindi'],
      availabilitySlots: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
        { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }, // Friday
      ],
    });

    // Create Dr. Amaan Ahmed counsellor
    const amaan = new Counsellor({
      name: 'Dr. Amaan Ahmed',
      email: 'amaan@counsellor.com',
      verified: true,
      languages: ['English', 'Hindi', 'Urdu'],
      availabilitySlots: [
        { dayOfWeek: 1, startTime: '10:00', endTime: '18:00' }, // Monday
        { dayOfWeek: 2, startTime: '10:00', endTime: '18:00' }, // Tuesday
        { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' }, // Wednesday
        { dayOfWeek: 4, startTime: '10:00', endTime: '18:00' }, // Thursday
        { dayOfWeek: 5, startTime: '10:00', endTime: '18:00' }, // Friday
        { dayOfWeek: 6, startTime: '09:00', endTime: '15:00' }, // Saturday
      ],
    });

    // Create Dr. Monis Kumar counsellor
    const monis = new Counsellor({
      name: 'Dr. Monis Kumar',
      email: 'monis@counsellor.com',
      verified: true,
      languages: ['English', 'Hindi', 'Tamil'],
      availabilitySlots: [
        { dayOfWeek: 1, startTime: '08:00', endTime: '16:00' }, // Monday
        { dayOfWeek: 2, startTime: '08:00', endTime: '16:00' }, // Tuesday
        { dayOfWeek: 3, startTime: '08:00', endTime: '16:00' }, // Wednesday
        { dayOfWeek: 4, startTime: '08:00', endTime: '16:00' }, // Thursday
        { dayOfWeek: 5, startTime: '08:00', endTime: '16:00' }, // Friday
        { dayOfWeek: 0, startTime: '10:00', endTime: '14:00' }, // Sunday
      ],
    });

    await Promise.all([sarah.save(), amaan.save(), monis.save()]);

    console.log('Database seeded successfully with Dr. Sarah, Dr. Amaan, and Dr. Monis counsellors');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
  
  mongoose.connect(mongoUri)
    .then(() => seedDatabase())
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
