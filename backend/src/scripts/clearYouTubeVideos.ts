import mongoose from 'mongoose';
import Resource from '../models/Resource';

const clearYouTubeVideos = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing video resources
    const result = await Resource.deleteMany({ category: 'video' });
    console.log(`✅ Cleared ${result.deletedCount} existing video resources`);

    // Verify no videos remain
    const remainingVideos = await Resource.countDocuments({ category: 'video' });
    console.log(`📊 Remaining videos in database: ${remainingVideos}`);

    console.log('🎬 All YouTube videos have been removed!');
    console.log('📝 Ready to add your custom videos.');

  } catch (error) {
    console.error('Error clearing YouTube videos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

clearYouTubeVideos();
