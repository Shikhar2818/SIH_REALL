"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Resource_1 = __importDefault(require("../models/Resource"));
const User_1 = __importDefault(require("../models/User"));
const googleapis_1 = require("googleapis");
const addYouTubeAudiosAuto = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        const adminUser = await User_1.default.findOne({ role: 'admin' });
        if (!adminUser) {
            console.error('❌ Admin user not found. Please run seedUsers.ts first.');
            return;
        }
        console.log(`👤 Using admin: ${adminUser.name} (${adminUser.email})`);
        const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
        if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY') {
            console.log('⚠️ YouTube API Key not configured. Using manual data instead.');
            console.log('📝 To get automatic video information, set YOUTUBE_API_KEY in your .env file');
            console.log('🔗 Get your API key from: https://console.developers.google.com/');
            await addManualAudioData(adminUser._id);
            return;
        }
        const youtube = googleapis_1.google.youtube({
            version: 'v3',
            auth: YOUTUBE_API_KEY,
        });
        console.log('🔑 YouTube API Key configured successfully');
        const audioUrls = [
            'https://www.youtube.com/watch?v=ca3fBRmmrBA&list=PLRVA1hW9BtYmeVk_2qf6zc0urEEOdTdez&index=1',
            'https://www.youtube.com/watch?v=gP9sGBywjks&list=PLRVA1hW9BtYmeVk_2qf6zc0urEEOdTdez&index=2',
            'https://www.youtube.com/watch?v=BZ-_KQezKmU&list=PLRVA1hW9BtYmeVk_2qf6zc0urEEOdTdez&index=3',
            'https://www.youtube.com/watch?v=Tu96yevGMEA&list=PLRVA1hW9BtYmeVk_2qf6zc0urEEOdTdez&index=4'
        ];
        await Resource_1.default.deleteMany({ category: 'audio' });
        console.log('🗑️ Cleared existing audio resources');
        for (let i = 0; i < audioUrls.length; i++) {
            const url = audioUrls[i];
            console.log(`\n📹 Processing audio ${i + 1}/${audioUrls.length}: ${url}`);
            try {
                const videoId = extractVideoId(url);
                if (!videoId) {
                    console.error(`❌ Could not extract video ID from: ${url}`);
                    continue;
                }
                console.log(`🎵 YouTube ID: ${videoId}`);
                const videoResponse = await youtube.videos.list({
                    part: ['snippet', 'statistics', 'contentDetails'],
                    id: [videoId],
                });
                if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
                    console.error(`❌ No video data found for ID: ${videoId}`);
                    continue;
                }
                const video = videoResponse.data.items[0];
                const snippet = video.snippet;
                const statistics = video.statistics;
                const contentDetails = video.contentDetails;
                const title = snippet.title || 'Untitled Audio';
                const description = snippet.description || '';
                const publishedAt = snippet.publishedAt || new Date().toISOString();
                const channelTitle = snippet.channelTitle || 'Unknown Channel';
                const thumbnails = snippet.thumbnails || {};
                const viewCount = parseInt(statistics.viewCount || '0');
                const duration = contentDetails.duration || 'PT0S';
                const thumbnailUrl = thumbnails.maxres?.url ||
                    thumbnails.high?.url ||
                    thumbnails.medium?.url ||
                    thumbnails.default?.url ||
                    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                const readableDuration = parseDuration(duration);
                const audioData = {
                    title: title,
                    description: description.length > 497 ? description.substring(0, 497) + '...' : description,
                    youtubeId: videoId,
                    youtubeUrl: url,
                    thumbnailUrl: thumbnailUrl,
                    duration: readableDuration,
                    tags: ['meditation', 'relaxation', 'english', 'audio'],
                    category: 'audio',
                    content: description.substring(0, 500),
                    isPublished: true,
                    featured: i < 2,
                    viewCount: viewCount,
                    authorId: adminUser._id,
                };
                const audio = new Resource_1.default(audioData);
                await audio.save();
                console.log(`✅ Added audio: "${title}"`);
                console.log(`   📺 Channel: ${channelTitle}`);
                console.log(`   📅 Published: ${new Date(publishedAt).toLocaleDateString()}`);
                console.log(`   ⏱️ Duration: ${readableDuration}`);
                console.log(`   👀 Views: ${viewCount.toLocaleString()}`);
                console.log(`   🏷️ Tags: ${audioData.tags.join(', ')}`);
                console.log(`   ⭐ Featured: ${audioData.featured ? 'Yes' : 'No'}`);
                if (i < audioUrls.length - 1) {
                    console.log('⏳ Waiting 1 second to respect API rate limits...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            catch (error) {
                console.error(`❌ Error processing ${url}:`, error);
                continue;
            }
        }
        const totalAudios = await Resource_1.default.countDocuments({ category: 'audio' });
        const englishCount = await Resource_1.default.countDocuments({ category: 'audio', tags: 'english' });
        const featuredCount = await Resource_1.default.countDocuments({ category: 'audio', featured: true });
        console.log(`\n🎵 Successfully created ${totalAudios} audio resources!`);
        console.log('📱 Audio resources are now available in the Resources section');
        console.log('🔗 Frontend URL: http://localhost:3000/resources');
        console.log(`\n📊 Audio breakdown:`);
        console.log(`   Total Audio Resources: ${totalAudios}`);
        console.log(`   English Audios: ${englishCount}`);
        console.log(`   Featured Audios: ${featuredCount}`);
    }
    catch (error) {
        console.error('Error adding YouTube audios:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
};
function extractVideoId(url) {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}
function parseDuration(duration) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match)
        return 'Unknown';
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}
async function addManualAudioData(adminUserId) {
    console.log('📝 Using manual audio data...');
    const manualAudios = [
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
            authorId: adminUserId,
        },
        {
            title: 'Deep Sleep Music - Ocean Sounds',
            description: 'Peaceful ocean sounds to help you fall asleep faster and sleep more deeply.',
            youtubeId: 'gP9sGBywjks',
            youtubeUrl: 'https://www.youtube.com/watch?v=gP9sGBywjks&list=PLRVA1hW9BtYmeVk_2qf6zc0urEEOdTdez&index=2',
            thumbnailUrl: 'https://img.youtube.com/vi/gP9sGBywjks/hqdefault.jpg',
            duration: '8:00:00',
            tags: ['sleep', 'ocean', 'relaxation', 'english', 'audio'],
            category: 'audio',
            content: 'Ocean sounds for deep sleep',
            isPublished: true,
            featured: false,
            viewCount: 1800000,
            authorId: adminUserId,
        },
        {
            title: 'Stress Relief Music - Nature Sounds',
            description: 'Calming nature sounds including birds, rain, and forest ambiance for stress relief.',
            youtubeId: 'BZ-_KQezKmU',
            youtubeUrl: 'https://www.youtube.com/watch?v=BZ-_KQezKmU&list=PLRVA1hW9BtYmeVk_2qf6zc0urEEOdTdez&index=3',
            thumbnailUrl: 'https://img.youtube.com/vi/BZ-_KQezKmU/hqdefault.jpg',
            duration: '3:00:00',
            tags: ['stress relief', 'nature', 'birds', 'english', 'audio'],
            category: 'audio',
            content: 'Nature sounds for stress relief',
            isPublished: true,
            featured: true,
            viewCount: 850000,
            authorId: adminUserId,
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
            authorId: adminUserId,
        }
    ];
    for (const audioData of manualAudios) {
        const audio = new Resource_1.default(audioData);
        await audio.save();
        console.log(`✅ Added audio: "${audioData.title}"`);
    }
    console.log(`\n🎵 Successfully created ${manualAudios.length} audio resources with manual data!`);
}
addYouTubeAudiosAuto();
//# sourceMappingURL=addYouTubeAudiosAuto.js.map