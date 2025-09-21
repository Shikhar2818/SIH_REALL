"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const playlistConfig = {
    playlistUrl: 'https://www.youtube.com/playlist?list=YOUR_PLAYLIST_ID',
    defaultSettings: {
        tags: ['mental health', 'education'],
        featured: false,
        isPublished: true,
        viewCount: 500,
    },
    videoOverrides: [
        {
            title: 'Specific Video Title',
            tags: ['anxiety', 'coping strategies'],
            featured: true,
            viewCount: 1500,
        },
    ]
};
const addYouTubePlaylist = async () => {
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
    }
    catch (error) {
        console.error('Error processing YouTube playlist:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
};
addYouTubePlaylist();
//# sourceMappingURL=addYouTubePlaylist.js.map