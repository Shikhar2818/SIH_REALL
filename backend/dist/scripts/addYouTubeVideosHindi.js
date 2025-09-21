"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Resource_1 = __importDefault(require("../models/Resource"));
const User_1 = __importDefault(require("../models/User"));
const googleapis_1 = require("googleapis");
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyAH1PjwFZ_3h6CQoGIBXAzhrNvNj9wfyD0';
const hindiVideoUrls = [
    'https://www.youtube.com/watch?v=1Bq4Zo-iHXM',
    'https://www.youtube.com/watch?v=t0f6javR1pM',
    'https://www.youtube.com/watch?v=jxEkBgzd9fA',
    'https://www.youtube.com/watch?v=gyvDrv5hFng',
    'https://www.youtube.com/watch?v=eAK14VoY7C0',
    'https://www.youtube.com/watch?v=CFyO8NInVyg',
    'https://www.youtube.com/watch?v=QlGrWaOC0sg'
];
const hindiVideoSettings = {
    defaultTags: ['mental health', 'hindi', 'education', 'mental health hindi'],
    featuredVideos: [],
    customTags: {}
};
const addYouTubeVideosHindi = async () => {
    try {
        if (YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
            console.log(`
🔑 YOUTUBE API KEY REQUIRED
============================

To automatically fetch video information, you need a YouTube Data API key.

📋 SETUP INSTRUCTIONS:

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Set the API key in your environment:

   Option A - Environment Variable:
   set YOUTUBE_API_KEY=your_api_key_here
   
   Option B - Edit this script:
   Replace 'YOUR_YOUTUBE_API_KEY_HERE' with your actual API key

🔗 API Key Setup Guide: https://developers.google.com/youtube/v3/getting-started

============================
`);
            return;
        }
        const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        const adminUser = await User_1.default.findOne({ role: 'admin' });
        if (!adminUser) {
            console.error('❌ Admin user not found. Please run seedUsers.ts first.');
            return;
        }
        console.log(`👤 Using admin: ${adminUser.name} (${adminUser.email})`);
        if (hindiVideoUrls.length === 0) {
            console.log(`
⚠️  NO HINDI VIDEOS CONFIGURED
===============================

Please add Hindi YouTube video URLs to the 'hindiVideoUrls' array in this script.

📝 HOW TO ADD HINDI VIDEOS:

1. Edit this file: backend/src/scripts/addYouTubeVideosHindi.ts
2. Add your Hindi YouTube URLs to the 'hindiVideoUrls' array
3. Run this script again

Example:
const hindiVideoUrls = [
  'https://www.youtube.com/watch?v=HINDI_VIDEO_ID_1',
  'https://youtu.be/HINDI_VIDEO_ID_2',
  'https://www.youtube.com/watch?v=HINDI_VIDEO_ID_3',
];

===============================
`);
            return;
        }
        const youtube = googleapis_1.google.youtube({
            version: 'v3',
            auth: YOUTUBE_API_KEY,
        });
        console.log('🎬 Starting Hindi video import...');
        console.log(`📺 Processing ${hindiVideoUrls.length} Hindi videos`);
        await Resource_1.default.deleteMany({ category: 'video', tags: { $in: ['hindi'] } });
        console.log('🗑️ Cleared existing Hindi videos');
        const createdVideos = [];
        const failedVideos = [];
        for (let i = 0; i < hindiVideoUrls.length; i++) {
            const url = hindiVideoUrls[i];
            console.log(`\n📺 Processing Hindi video ${i + 1}/${hindiVideoUrls.length}: ${url}`);
            try {
                const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/);
                if (!videoIdMatch || !videoIdMatch[1]) {
                    console.error(`❌ Invalid YouTube URL: ${url}`);
                    failedVideos.push({ url, error: 'Invalid URL format' });
                    continue;
                }
                const videoId = videoIdMatch[1];
                console.log(`🔍 Fetching data for Hindi video ID: ${videoId}`);
                const response = await youtube.videos.list({
                    part: ['snippet', 'statistics', 'contentDetails'],
                    id: [videoId],
                });
                if (!response.data.items || response.data.items.length === 0) {
                    console.error(`❌ Video not found or private: ${url}`);
                    failedVideos.push({ url, error: 'Video not found or private' });
                    continue;
                }
                const videoData = response.data.items[0];
                const snippet = videoData.snippet;
                const statistics = videoData.statistics;
                const contentDetails = videoData.contentDetails;
                const title = snippet.title;
                const fullDescription = snippet.description;
                const description = fullDescription.length > 500 ? fullDescription.substring(0, 497) + '...' : fullDescription;
                const publishedAt = snippet.publishedAt;
                const channelTitle = snippet.channelTitle;
                const thumbnails = snippet.thumbnails;
                const thumbnailUrl = thumbnails.maxres?.url ||
                    thumbnails.high?.url ||
                    thumbnails.medium?.url ||
                    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                const viewCount = parseInt(statistics.viewCount || '0');
                const duration = contentDetails.duration;
                const readableDuration = parseDuration(duration);
                const isFeatured = hindiVideoSettings.featuredVideos.includes(title);
                const customTags = hindiVideoSettings.customTags[title] || hindiVideoSettings.defaultTags;
                const video = new Resource_1.default({
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
                    duration: readableDuration,
                    viewCount: viewCount,
                });
                await video.save();
                createdVideos.push(video);
                console.log(`✅ Successfully added Hindi video: "${title}"`);
                console.log(`   📺 YouTube ID: ${videoId}`);
                console.log(`   👤 Channel: ${channelTitle}`);
                console.log(`   📅 Published: ${new Date(publishedAt).toLocaleDateString()}`);
                console.log(`   ⏱️ Duration: ${readableDuration}`);
                console.log(`   👀 Views: ${viewCount.toLocaleString()}`);
                console.log(`   🏷️ Tags: ${customTags.join(', ')}`);
                console.log(`   ⭐ Featured: ${isFeatured ? 'Yes' : 'No'}`);
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            catch (error) {
                console.error(`❌ Error processing Hindi video: ${url}`);
                console.error(`   Error: ${error.message}`);
                failedVideos.push({ url, error: error.message });
            }
        }
        console.log(`\n🎬 HINDI VIDEO IMPORT COMPLETE!`);
        console.log(`✅ Successfully imported: ${createdVideos.length} Hindi videos`);
        console.log(`❌ Failed imports: ${failedVideos.length} Hindi videos`);
        if (failedVideos.length > 0) {
            console.log(`\n❌ FAILED HINDI VIDEOS:`);
            failedVideos.forEach((failed, index) => {
                console.log(`${index + 1}. ${failed.url}`);
                console.log(`   Error: ${failed.error}`);
            });
        }
        console.log(`\n📱 Hindi videos are now available in the Resources section!`);
        console.log(`🔗 Frontend URL: http://localhost:3000/resources`);
        console.log(`\n💡 TIP: Hindi videos will be tagged with 'hindi' for easy filtering!`);
    }
    catch (error) {
        console.error('Error in Hindi video import:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
};
function parseDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match)
        return 'N/A';
    const hours = (parseInt(match[1]) || 0);
    const minutes = (parseInt(match[2]) || 0);
    const seconds = (parseInt(match[3]) || 0);
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}
console.log(`
🎬 HINDI YOUTUBE VIDEO IMPORT
==============================

🚀 FEATURES:
- ✅ Automatically fetches Hindi video titles
- ✅ Automatically fetches descriptions  
- ✅ Automatically fetches thumbnails
- ✅ Automatically fetches durations
- ✅ Automatically fetches view counts
- ✅ Automatically fetches channel info
- ✅ Supports custom tags and featured videos
- ✅ Hindi-specific tagging

📝 HOW TO USE:

1. Edit this file: backend/src/scripts/addYouTubeVideosHindi.ts
2. Add your Hindi YouTube URLs to the 'hindiVideoUrls' array
3. Optionally customize tags and featured videos
4. Run: npx ts-node src/scripts/addYouTubeVideosHindi.ts

🔗 SUPPORTED URL FORMATS:
- https://www.youtube.com/watch?v=VIDEO_ID
- https://youtu.be/VIDEO_ID
- https://youtube.com/watch?v=VIDEO_ID

📋 CUSTOMIZATION OPTIONS:

// Custom tags for specific Hindi videos
customTags: {
  'Hindi Video Title': ['depression', 'anxiety', 'stress'],
}

// Mark Hindi videos as featured
featuredVideos: ['Hindi Video Title 1', 'Hindi Video Title 2']

==============================
`);
addYouTubeVideosHindi();
//# sourceMappingURL=addYouTubeVideosHindi.js.map