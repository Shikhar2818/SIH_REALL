import mongoose from 'mongoose';
import Resource from '../models/Resource';
import User from '../models/User';

// List of YouTube video URLs - just paste your URLs here!
const youtubeUrls = [
  // Add your YouTube video URLs here
  // 'https://www.youtube.com/watch?v=VIDEO_ID_1',
  // 'https://www.youtube.com/watch?v=VIDEO_ID_2',
  // 'https://youtu.be/VIDEO_ID_3',
  // Add as many as you want...
];

// Custom settings for videos (optional)
const videoSettings = {
  defaultTags: ['mental health', 'education'], // Default tags for all videos
  featuredVideos: [], // Array of video titles to mark as featured
  customTags: {
    // Add custom tags for specific videos by title
    // 'Video Title': ['anxiety', 'coping strategies'],
  },
  customTitles: {
    // Override auto-generated titles if needed
    // 'https://www.youtube.com/watch?v=VIDEO_ID': 'Your Custom Title',
  },
  customDescriptions: {
    // Override auto-generated descriptions if needed
    // 'https://www.youtube.com/watch?v=VIDEO_ID': 'Your custom description',
  }
};

const addYouTubeVideosSimple = async () => {
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

    if (youtubeUrls.length === 0) {
      console.log(`
⚠️  NO VIDEOS CONFIGURED
=========================

Please add YouTube video URLs to the 'youtubeUrls' array in this script.

📝 HOW TO ADD VIDEOS:

1. Edit this file: backend/src/scripts/addYouTubeVideosSimple.ts
2. Add your YouTube URLs to the 'youtubeUrls' array
3. Run this script again

Example:
const youtubeUrls = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtu.be/ANOTHER_VIDEO_ID',
  'https://www.youtube.com/watch?v=THIRD_VIDEO_ID',
];

=========================
`);
      return;
    }

    console.log('🎬 Starting simple video import...');
    console.log(`📺 Processing ${youtubeUrls.length} videos`);

    // Clear existing videos
    await Resource.deleteMany({ category: 'video' });
    console.log('🗑️ Cleared existing videos');

    const createdVideos = [];
    const failedVideos = [];

    // Process each video URL
    for (let i = 0; i < youtubeUrls.length; i++) {
      const url = youtubeUrls[i];
      console.log(`\n📺 Processing video ${i + 1}/${youtubeUrls.length}: ${url}`);

      try {
        // Extract video ID from URL
        const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/);
        
        if (!videoIdMatch || !videoIdMatch[1]) {
          console.error(`❌ Invalid YouTube URL: ${url}`);
          failedVideos.push({ url, error: 'Invalid URL format' });
          continue;
        }

        const videoId = videoIdMatch[1];
        console.log(`🔍 Processing video ID: ${videoId}`);

        // Get custom title and description if provided
        const customTitle = videoSettings.customTitles[url];
        const customDescription = videoSettings.customDescriptions[url];

        // Generate title from video ID if not custom
        const title = customTitle || `Video ${videoId}`;

        // Generate description if not custom
        const description = customDescription || `Educational video content. Video ID: ${videoId}`;

        // Get thumbnail URL
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

        // Determine if video should be featured
        const isFeatured = videoSettings.featuredVideos.includes(title);

        // Get custom tags or use default
        const customTags = videoSettings.customTags[title] || videoSettings.defaultTags;

        // Create video resource
        const video = new Resource({
          title: title,
          description: description,
          content: description,
          category: 'video',
          tags: customTags,
          authorId: adminUser._id,
          isPublished: true,
          featured: isFeatured,
          youtubeId: videoId,
          youtubeUrl: url,
          thumbnailUrl: thumbnailUrl,
          duration: 'N/A',
          viewCount: 0,
        });

        await video.save();
        createdVideos.push(video);

        console.log(`✅ Successfully added: "${title}"`);
        console.log(`   📺 YouTube ID: ${videoId}`);
        console.log(`   🏷️ Tags: ${customTags.join(', ')}`);
        console.log(`   ⭐ Featured: ${isFeatured ? 'Yes' : 'No'}`);

      } catch (error) {
        console.error(`❌ Error processing video: ${url}`);
        console.error(`   Error: ${error.message}`);
        failedVideos.push({ url, error: error.message });
      }
    }

    // Summary
    console.log(`\n🎬 IMPORT COMPLETE!`);
    console.log(`✅ Successfully imported: ${createdVideos.length} videos`);
    console.log(`❌ Failed imports: ${failedVideos.length} videos`);

    if (failedVideos.length > 0) {
      console.log(`\n❌ FAILED VIDEOS:`);
      failedVideos.forEach((failed, index) => {
        console.log(`${index + 1}. ${failed.url}`);
        console.log(`   Error: ${failed.error}`);
      });
    }

    console.log(`\n📱 Videos are now available in the Resources section!`);
    console.log(`🔗 Frontend URL: http://localhost:3000/resources`);
    console.log(`\n💡 TIP: You can edit video titles and descriptions in the admin panel!`);

  } catch (error) {
    console.error('Error in video import:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Instructions for the user
console.log(`
🎬 SIMPLE YOUTUBE VIDEO IMPORT
===============================

🚀 FEATURES:
- ✅ No API key required
- ✅ Automatic thumbnail generation
- ✅ Custom titles and descriptions
- ✅ Custom tags and featured videos
- ✅ Works with any YouTube URL

📝 HOW TO USE:

1. Edit this file: backend/src/scripts/addYouTubeVideosSimple.ts
2. Add your YouTube URLs to the 'youtubeUrls' array
3. Optionally customize titles, descriptions, and tags
4. Run: npx ts-node src/scripts/addYouTubeVideosSimple.ts

🔗 SUPPORTED URL FORMATS:
- https://www.youtube.com/watch?v=VIDEO_ID
- https://youtu.be/VIDEO_ID
- https://youtube.com/watch?v=VIDEO_ID

📋 CUSTOMIZATION OPTIONS:

// Custom titles for specific videos
customTitles: {
  'https://www.youtube.com/watch?v=VIDEO_ID': 'Your Custom Title',
}

// Custom descriptions
customDescriptions: {
  'https://www.youtube.com/watch?v=VIDEO_ID': 'Your custom description',
}

// Custom tags for specific videos
customTags: {
  'Your Video Title': ['anxiety', 'coping strategies'],
}

// Mark videos as featured
featuredVideos: ['Video Title 1', 'Video Title 2']

===============================
`);

addYouTubeVideosSimple();
