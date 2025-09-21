import mongoose from 'mongoose';
import Resource from '../models/Resource';
import User from '../models/User';

const seedYouTubeAudios = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ Admin user not found. Please run seedUsers.ts first.');
      return;
    }

    console.log(`👤 Using admin: ${adminUser.name} (${adminUser.email})`);

    // Sample audio resources (meditation, relaxation, etc.)
    const sampleAudios = [
      {
        title: 'Guided Meditation for Anxiety Relief',
        description: 'A calming guided meditation to help reduce anxiety and promote relaxation.',
        youtubeId: 'ca3fBRmmrBA',
        youtubeUrl: 'https://www.youtube.com/watch?v=ca3fBRmmrBA&list=PLRVA1hW9BtYmeVk_2qf6zc0urEEOdTdez&index=1',
        thumbnailUrl: 'https://img.youtube.com/vi/ca3fBRmmrBA/hqdefault.jpg',
        duration: '10:00',
        tags: ['meditation', 'anxiety', 'relaxation', 'english', 'audio'],
        category: 'audio',
        content: 'Guided meditation for anxiety relief',
        isPublished: true,
        featured: true,
        viewCount: 250000,
        authorId: adminUser._id,
      },
      {
        title: 'Deep Sleep Music - Ocean Sounds',
        description: 'Peaceful ocean sounds to help you fall asleep faster and sleep more deeply.',
        youtubeId: 'gP9sGBywjks',
        youtubeUrl: 'https://www.youtube.com/watch?v=gP9sGBywjks&list=PLRVA1hW9BtYmeVk_2qf6zc0urEEOdTdez&index=2',
        thumbnailUrl: 'https://img.youtube.com/vi/gP9sGBywjks/hqdefault.jpg',
        duration: '8:00:00', // 8 hours
        tags: ['sleep', 'ocean', 'relaxation', 'english', 'audio'],
        category: 'audio',
        content: 'Ocean sounds for deep sleep',
        isPublished: true,
        featured: false,
        viewCount: 1800000,
        authorId: adminUser._id,
      },
      {
        title: 'Stress Relief Music - Nature Sounds',
        description: 'Calming nature sounds including birds, rain, and forest ambiance for stress relief.',
        youtubeId: 'BZ-_KQezKmU',
        youtubeUrl: 'https://www.youtube.com/watch?v=BZ-_KQezKmU&list=PLRVA1hW9BtYmeVk_2qf6zc0urEEOdTdez&index=3',
        thumbnailUrl: 'https://img.youtube.com/vi/BZ-_KQezKmU/hqdefault.jpg',
        duration: '3:00:00', // 3 hours
        tags: ['stress relief', 'nature', 'birds', 'english', 'audio'],
        category: 'audio',
        content: 'Nature sounds for stress relief',
        isPublished: true,
        featured: true,
        viewCount: 850000,
        authorId: adminUser._id,
      },
      {
        title: 'Mindfulness Breathing Exercise',
        description: 'A simple breathing exercise to help you stay present and reduce stress.',
        youtubeId: 'Tu96yevGMEA',
        youtubeUrl: 'https://www.youtube.com/watch?v=Tu96yevGMEA&list=PLRVA1hW9BtYmeVk_2qf6zc0urEEOdTdez&index=4',
        thumbnailUrl: 'https://img.youtube.com/vi/Tu96yevGMEA/hqdefault.jpg',
        duration: '5:00',
        tags: ['mindfulness', 'breathing', 'stress relief', 'english', 'audio'],
        category: 'audio',
        content: 'Mindfulness breathing exercise',
        isPublished: true,
        featured: false,
        viewCount: 420000,
        authorId: adminUser._id,
      }
    ];

    // Clear existing audio resources
    await Resource.deleteMany({ category: 'audio' });
    console.log('🗑️ Cleared existing audio resources');

    // Create new audio resources
    const createdAudios = [];
    for (const audioData of sampleAudios) {
      const audio = new Resource(audioData);
      await audio.save();
      createdAudios.push(audio);
      
      console.log(`✅ Added audio: "${audioData.title}"`);
      console.log(`   🎵 YouTube ID: ${audioData.youtubeId}`);
      console.log(`   ⏱️ Duration: ${audioData.duration}`);
      console.log(`   👀 Views: ${audioData.viewCount.toLocaleString()}`);
      console.log(`   🏷️ Tags: ${audioData.tags.join(', ')}`);
      console.log(`   ⭐ Featured: ${audioData.featured ? 'Yes' : 'No'}`);
    }

    console.log(`\n🎵 Successfully created ${createdAudios.length} audio resources!`);
    console.log('📱 Audio resources are now available in the Resources section');
    console.log('🔗 Frontend URL: http://localhost:3000/resources');

    // Show breakdown
    const englishCount = await Resource.countDocuments({ category: 'audio', tags: 'english' });
    const hindiCount = await Resource.countDocuments({ category: 'audio', tags: 'hindi' });
    const featuredCount = await Resource.countDocuments({ category: 'audio', featured: true });

    console.log(`\n📊 Audio breakdown:`);
    console.log(`   English Audios: ${englishCount}`);
    console.log(`   Hindi Audios: ${hindiCount}`);
    console.log(`   Featured Audios: ${featuredCount}`);
    console.log(`   Total Audio Resources: ${createdAudios.length}`);

  } catch (error) {
    console.error('Error seeding YouTube audios:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedYouTubeAudios();
