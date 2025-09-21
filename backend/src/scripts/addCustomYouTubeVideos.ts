import mongoose from 'mongoose';
import Resource from '../models/Resource';
import User from '../models/User';

// Custom video configuration
const customVideos = [
  // Add your videos here - replace these examples with your actual videos
  {
    title: 'Your Video Title 1',
    description: 'Description of your video',
    youtubeUrl: 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID_1',
    tags: ['mental health', 'education'],
    featured: true,
    isPublished: true,
    viewCount: 1000,
  },
  {
    title: 'Your Video Title 2', 
    description: 'Description of your second video',
    youtubeUrl: 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID_2',
    tags: ['anxiety', 'coping strategies'],
    featured: false,
    isPublished: true,
    viewCount: 800,
  },
  // Add more videos as needed...
];

const addCustomYouTubeVideos = async () => {
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

    // Clear existing videos first
    await Resource.deleteMany({ category: 'video' });
    console.log('🗑️ Cleared existing videos');

    if (customVideos.length === 0) {
      console.log('⚠️ No custom videos configured. Please edit this script and add your video data.');
      return;
    }

    // Process each video
    const createdVideos = [];
    for (const videoData of customVideos) {
      try {
        // Extract YouTube video ID from URL
        const videoIdMatch = videoData.youtubeUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/);
        
        if (!videoIdMatch || !videoIdMatch[1]) {
          console.error(`❌ Invalid YouTube URL: ${videoData.youtubeUrl}`);
          continue;
        }

        const youtubeId = videoIdMatch[1];
        const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

        const video = new Resource({
          title: videoData.title,
          description: videoData.description,
          content: videoData.description, // Using description as content for videos
          category: 'video',
          tags: videoData.tags,
          authorId: adminUser._id,
          isPublished: videoData.isPublished,
          featured: videoData.featured,
          youtubeId: youtubeId,
          youtubeUrl: videoData.youtubeUrl,
          thumbnailUrl: thumbnailUrl,
          duration: 'N/A', // You can update this if you have duration info
          viewCount: videoData.viewCount || 0,
        });

        await video.save();
        createdVideos.push(video);
        
        console.log(`✅ Added: ${videoData.title}`);
        console.log(`   📺 YouTube ID: ${youtubeId}`);
        console.log(`   🏷️ Tags: ${videoData.tags.join(', ')}`);
        console.log(`   ⭐ Featured: ${videoData.featured ? 'Yes' : 'No'}`);
        
      } catch (error) {
        console.error(`❌ Error adding video "${videoData.title}":`, error);
      }
    }

    console.log(`\n🎬 Successfully added ${createdVideos.length} custom videos!`);
    console.log('📱 Videos are now available in the Resources section');
    console.log('🔗 Frontend URL: http://localhost:3000/resources');

  } catch (error) {
    console.error('Error adding custom YouTube videos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Instructions for the user
console.log(`
🎬 CUSTOM YOUTUBE VIDEOS SETUP
================================

📝 TO ADD YOUR VIDEOS:

1. Edit this file: backend/src/scripts/addCustomYouTubeVideos.ts
2. Replace the 'customVideos' array with your video data
3. Run: npx ts-node src/scripts/addCustomYouTubeVideos.ts

📋 VIDEO DATA FORMAT:
{
  title: 'Your Video Title',
  description: 'Video description',
  youtubeUrl: 'https://www.youtube.com/watch?v=VIDEO_ID',
  tags: ['tag1', 'tag2'],
  featured: true/false,
  isPublished: true,
  viewCount: 1000
}

🔗 SUPPORTED YOUTUBE URL FORMATS:
- https://www.youtube.com/watch?v=VIDEO_ID
- https://youtu.be/VIDEO_ID
- https://youtube.com/watch?v=VIDEO_ID

================================
`);

addCustomYouTubeVideos();
