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
const youtubeUrls = [
    'https://youtu.be/9FbBwehUp5Q?si=KGgAaaObrHJBILk-',
    'https://youtu.be/EbNAXpCnjTg?si=Nu82L-wU_GQKYNqv',
    'https://youtu.be/ke9btVi6H3k?si=QW_ymtECKtvOH1Hs',
    'https://youtu.be/bY3As3lKMno?si=TrUjMzCoHYXRv3H-',
    'https://youtu.be/1i9OktVsTWo?si=E6EYNxAQecHXg5Ns',
    'https://youtu.be/IaSpas9hWNQ?si=9hxSf3Bu7iLOnVT6',
    'https://youtu.be/jPfnJtkQugQ?si=bLQZ6fr3P_qbO-nS',
    'https://youtu.be/XCAQHpXqIA8?si=x1TmeKiBxJLwo_Bk',
    'https://youtu.be/nKI03ncN374?si=-fslkjyqiqQciYjX',
    'https://youtu.be/Yk2yW823ZMg?si=aHAxb-d5uciB8Ss2',
    'https://youtu.be/E2DVIUd8O-g?si=dsnZ0Clcaj2AuGZA',
    'https://youtu.be/Ey4m9DvvHcI?si=kiEdmjt7F_5SW5Ym',
    'https://youtu.be/NbRL67D-tvk?si=LUI5LCm4EKQza96S',
    'https://youtu.be/Bk2-dKH2Ta4?si=iZ_89lzN7Xl07B1Z',
    'https://youtu.be/WuyPuH9ojCE?si=uwYQIcd16vOfxHzU',
    'https://youtu.be/TYWI929nZKg?si=VcHEqH-ViBU2mDpx',
    'https://youtu.be/0fL-pn80s-c?si=a9jK6euNWOzqVH3j',
    'https://youtu.be/z5NLfOzKbLs?si=yaTYtbRvgE9Fl8qu',
    'https://youtu.be/VNLSCuI4P0w?si=dr29tqGPPNP8ATmK',
    'https://youtu.be/BHY0FxzoKZE?si=YsjZ12Ucz9o7WKvd',
    'https://youtu.be/lV8ATfkCOww?si=_2-FwPFD-REQnwJN',
    'https://youtu.be/wIUcc8g17wg?si=ZJWYhxgXNUmsI_b_',
    'https://youtu.be/fNxfR0hovzY?si=ogsvPwSi1KKTuPIl',
    'https://youtu.be/RCUJah0Q70E?si=19JfsBHp6ZcVluqS',
    'https://youtu.be/XV2tHcJzNtg?si=58_MZWnLeavDGDyX',
    'https://youtu.be/tfbM6vYsW9g?si=dQnezu2xBeSJGLLM',
    'https://youtu.be/qyramLcTM30?si=dkRVNeAw5vXgMJkB',
    'https://youtu.be/YyjBKqsJqAo?si=TRPP6D_AZBva9FP2',
    'https://youtu.be/_DjBIqm5KWk?si=B36k3j_lyP-KeuLX'
];
const videoSettings = {
    defaultTags: ['mental health', 'education', 'english'],
    featuredVideos: [],
    customTags: {}
};
const addYouTubeVideosAuto = async () => {
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
        if (youtubeUrls.length === 0) {
            console.log(`
⚠️  NO VIDEOS CONFIGURED
=========================

Please add YouTube video URLs to the 'youtubeUrls' array in this script.

📝 HOW TO ADD VIDEOS:

1. Edit this file: backend/src/scripts/addYouTubeVideosAuto.ts
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
        const youtube = googleapis_1.google.youtube({
            version: 'v3',
            auth: YOUTUBE_API_KEY,
        });
        console.log('🎬 Starting automatic video import...');
        console.log(`📺 Processing ${youtubeUrls.length} videos`);
        await Resource_1.default.deleteMany({ category: 'video' });
        console.log('🗑️ Cleared existing videos');
        const createdVideos = [];
        const failedVideos = [];
        for (let i = 0; i < youtubeUrls.length; i++) {
            const url = youtubeUrls[i];
            console.log(`\n📺 Processing video ${i + 1}/${youtubeUrls.length}: ${url}`);
            try {
                const videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/);
                if (!videoIdMatch || !videoIdMatch[1]) {
                    console.error(`❌ Invalid YouTube URL: ${url}`);
                    failedVideos.push({ url, error: 'Invalid URL format' });
                    continue;
                }
                const videoId = videoIdMatch[1];
                console.log(`🔍 Fetching data for video ID: ${videoId}`);
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
                const isFeatured = videoSettings.featuredVideos.includes(title);
                const customTags = videoSettings.customTags[title] || videoSettings.defaultTags;
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
                console.log(`✅ Successfully added: "${title}"`);
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
                console.error(`❌ Error processing video: ${url}`);
                console.error(`   Error: ${error.message}`);
                failedVideos.push({ url, error: error.message });
            }
        }
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
    }
    catch (error) {
        console.error('Error in automatic video import:', error);
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
🎬 AUTOMATIC YOUTUBE VIDEO IMPORT
==================================

🚀 FEATURES:
- ✅ Automatically fetches video titles
- ✅ Automatically fetches descriptions  
- ✅ Automatically fetches thumbnails
- ✅ Automatically fetches durations
- ✅ Automatically fetches view counts
- ✅ Automatically fetches channel info
- ✅ Supports custom tags and featured videos

📝 SETUP REQUIRED:

1. Get YouTube Data API Key:
   - Go to: https://console.cloud.google.com/
   - Enable YouTube Data API v3
   - Create API Key

2. Set API Key:
   - Option A: set YOUTUBE_API_KEY=your_key_here
   - Option B: Edit this script and replace YOUR_YOUTUBE_API_KEY_HERE

3. Add your video URLs to the 'youtubeUrls' array

4. Run: npx ts-node src/scripts/addYouTubeVideosAuto.ts

🔗 SUPPORTED URL FORMATS:
- https://www.youtube.com/watch?v=VIDEO_ID
- https://youtu.be/VIDEO_ID
- https://youtube.com/watch?v=VIDEO_ID

==================================
`);
addYouTubeVideosAuto();
//# sourceMappingURL=addYouTubeVideosAuto.js.map