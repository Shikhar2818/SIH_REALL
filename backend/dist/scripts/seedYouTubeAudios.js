"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Resource_1 = __importDefault(require("../models/Resource"));
const User_1 = __importDefault(require("../models/User"));
const seedYouTubeAudios = async () => {
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
                duration: '8:00:00',
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
                duration: '3:00:00',
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
        await Resource_1.default.deleteMany({ category: 'audio' });
        console.log('🗑️ Cleared existing audio resources');
        const createdAudios = [];
        for (const audioData of sampleAudios) {
            const audio = new Resource_1.default(audioData);
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
        const englishCount = await Resource_1.default.countDocuments({ category: 'audio', tags: 'english' });
        const hindiCount = await Resource_1.default.countDocuments({ category: 'audio', tags: 'hindi' });
        const featuredCount = await Resource_1.default.countDocuments({ category: 'audio', featured: true });
        console.log(`\n📊 Audio breakdown:`);
        console.log(`   English Audios: ${englishCount}`);
        console.log(`   Hindi Audios: ${hindiCount}`);
        console.log(`   Featured Audios: ${featuredCount}`);
        console.log(`   Total Audio Resources: ${createdAudios.length}`);
    }
    catch (error) {
        console.error('Error seeding YouTube audios:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
};
seedYouTubeAudios();
//# sourceMappingURL=seedYouTubeAudios.js.map