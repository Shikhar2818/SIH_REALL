import mongoose from 'mongoose';
import Resource from '../models/Resource';

const updateEnglishTags = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Update existing videos to add 'english' tag
    const result = await Resource.updateMany(
      { category: 'video', tags: { $nin: ['hindi'] } }, // Videos that don't have 'hindi' tag
      { $addToSet: { tags: 'english' } } // Add 'english' tag if not present
    );

    console.log(`✅ Updated ${result.modifiedCount} existing videos with English tag`);

    // Show current video counts by language
    const englishCount = await Resource.countDocuments({ category: 'video', tags: 'english' });
    const hindiCount = await Resource.countDocuments({ category: 'video', tags: 'hindi' });
    const totalCount = await Resource.countDocuments({ category: 'video' });

    console.log(`📊 Video Statistics:`);
    console.log(`   Total Videos: ${totalCount}`);
    console.log(`   English Videos: ${englishCount}`);
    console.log(`   Hindi Videos: ${hindiCount}`);

  } catch (error) {
    console.error('Error updating English tags:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

updateEnglishTags();
