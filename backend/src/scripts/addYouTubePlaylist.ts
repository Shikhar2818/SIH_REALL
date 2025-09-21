import mongoose from 'mongoose';
import Resource from '../models/Resource';
import User from '../models/User';

// YouTube Playlist Configuration
const playlistConfig = {
  // Replace with your playlist URL
  playlistUrl: 'https://www.youtube.com/playlist?list=YOUR_PLAYLIST_ID',
  
  // Custom settings for all videos in playlist
  defaultSettings: {
    tags: ['mental health', 'education'], // Default tags for all videos
    featured: false, // Set to true to feature all videos
    isPublished: true,
    viewCount: 500, // Default view count
  },
  
  // Individual video overrides (optional)
  // Use this to customize specific videos by title or position
  videoOverrides: [
    {
      title: 'Specific Video Title', // Match by title
      tags: ['anxiety', 'coping strategies'],
      featured: true,
      viewCount: 1500,
    },
    // Add more overrides as needed
  ]
};

const addYouTubePlaylist = async () => {
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

    // Extract playlist ID from URL
    const playlistIdMatch = playlistConfig.playlistUrl.match(/[?&]list=([^&]+)/);
    
    if (!playlistIdMatch || !playlistIdMatch[1]) {
      console.error('❌ Invalid YouTube playlist URL. Please check the URL format.');
      console.log('📝 Expected format: https://www.youtube.com/playlist?list=PLAYLIST_ID');
      return;
    }

    const playlistId = playlistIdMatch[1];
    console.log(`📺 Playlist ID: ${playlistId}`);

    console.log(`
🎬 YOUTUBE PLAYLIST INTEGRATION
================================

⚠️  NOTE: This script requires YouTube Data API v3 to fetch playlist videos.
For now, this is a template script. You have two options:

OPTION 1: Manual Video Addition
- Edit addCustomYouTubeVideos.ts with your individual video URLs
- Run: npx ts-node src/scripts/addCustomYouTubeVideos.ts

OPTION 2: YouTube API Integration (Advanced)
- Get YouTube Data API key from Google Cloud Console
- Install googleapis package: npm install googleapis
- Modify this script to use the API

📋 CURRENT PLAYLIST CONFIG:
- URL: ${playlistConfig.playlistUrl}
- Default Tags: ${playlistConfig.defaultSettings.tags.join(', ')}
- Featured: ${playlistConfig.defaultSettings.featured}
- Published: ${playlistConfig.defaultSettings.isPublished}

================================
`);

  } catch (error) {
    console.error('Error processing YouTube playlist:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

addYouTubePlaylist();
