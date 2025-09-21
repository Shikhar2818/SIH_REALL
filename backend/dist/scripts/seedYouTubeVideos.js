"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Resource_1 = __importDefault(require("../models/Resource"));
const User_1 = __importDefault(require("../models/User"));
const seedYouTubeVideos = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        const admin = await User_1.default.findOne({ role: 'admin' });
        if (!admin) {
            console.log('No admin user found. Please create an admin user first.');
            return;
        }
        const sampleVideos = [
            {
                title: 'Understanding Anxiety: A Complete Guide',
                description: 'Learn about anxiety disorders, their symptoms, and effective coping strategies from mental health professionals.',
                content: 'This comprehensive video covers the basics of anxiety disorders, including generalized anxiety disorder, panic disorder, and social anxiety disorder. Learn about common symptoms, triggers, and evidence-based treatment options.',
                category: 'video',
                youtubeId: 'dZ_6U14febg',
                youtubeUrl: 'https://www.youtube.com/watch?v=dZ_6U14febg',
                tags: ['anxiety', 'mental health', 'education', 'coping strategies'],
                isPublished: true,
                featured: true,
                viewCount: 1250,
                authorId: admin._id,
            },
            {
                title: 'Mindfulness Meditation for Stress Relief',
                description: 'A guided meditation session to help reduce stress and promote mental well-being.',
                content: 'Join this 10-minute guided meditation session designed to help you relax, reduce stress, and improve your mental clarity. Perfect for beginners.',
                category: 'video',
                youtubeId: 'ZToicYcHIOU',
                youtubeUrl: 'https://www.youtube.com/watch?v=ZToicYcHIOU',
                tags: ['meditation', 'mindfulness', 'stress relief', 'relaxation'],
                isPublished: true,
                featured: true,
                viewCount: 890,
                authorId: admin._id,
            },
            {
                title: 'Depression: Signs, Symptoms, and Treatment',
                description: 'Understanding depression - its causes, symptoms, and available treatment options.',
                content: 'This educational video explains depression in detail, including major depressive disorder, persistent depressive disorder, and seasonal affective disorder. Learn about symptoms, causes, and treatment approaches.',
                category: 'video',
                youtubeId: 'XiCrniLQGYc',
                youtubeUrl: 'https://www.youtube.com/watch?v=XiCrniLQGYc',
                tags: ['depression', 'mental health', 'education', 'treatment'],
                isPublished: true,
                featured: false,
                viewCount: 2100,
                authorId: admin._id,
            },
            {
                title: 'Building Resilience in Difficult Times',
                description: 'Learn practical strategies to build mental resilience and bounce back from challenges.',
                content: 'Discover evidence-based techniques for building resilience, including cognitive reframing, social support, and healthy coping mechanisms.',
                category: 'video',
                youtubeId: 'e8tY6G9gHq0',
                youtubeUrl: 'https://www.youtube.com/watch?v=e8tY6G9gHq0',
                tags: ['resilience', 'coping skills', 'mental health', 'personal growth'],
                isPublished: true,
                featured: false,
                viewCount: 750,
                authorId: admin._id,
            },
            {
                title: 'Sleep Hygiene for Better Mental Health',
                description: 'Tips and strategies for improving sleep quality to support mental well-being.',
                content: 'Learn about the connection between sleep and mental health, and discover practical tips for establishing healthy sleep habits.',
                category: 'video',
                youtubeId: 'nNhDkK4uFhg',
                youtubeUrl: 'https://www.youtube.com/watch?v=nNhDkK4uFhg',
                tags: ['sleep', 'mental health', 'wellness', 'healthy habits'],
                isPublished: true,
                featured: false,
                viewCount: 640,
                authorId: admin._id,
            },
            {
                title: 'Social Anxiety: Overcoming Fear of Social Situations',
                description: 'A comprehensive guide to understanding and managing social anxiety disorder.',
                content: 'This video provides an in-depth look at social anxiety disorder, including its symptoms, causes, and evidence-based treatment approaches including CBT and exposure therapy.',
                category: 'video',
                youtubeId: 'K8qpn6kNJ_g',
                youtubeUrl: 'https://www.youtube.com/watch?v=K8qpn6kNJ_g',
                tags: ['social anxiety', 'anxiety disorders', 'CBT', 'therapy'],
                isPublished: true,
                featured: false,
                viewCount: 1100,
                authorId: admin._id,
            }
        ];
        await Resource_1.default.deleteMany({ category: 'video' });
        console.log('✅ Cleared all existing video resources');
        const createdVideos = [];
        for (const videoData of sampleVideos) {
            const video = new Resource_1.default(videoData);
            await video.save();
            createdVideos.push(video);
        }
        console.log(`\n✅ Created ${createdVideos.length} YouTube video resources`);
        console.log(`📊 Video breakdown:`);
        createdVideos.forEach((video, index) => {
            console.log(`${index + 1}. ${video.title}`);
            console.log(`   - Views: ${video.viewCount}`);
            console.log(`   - Featured: ${video.featured ? 'Yes' : 'No'}`);
            console.log(`   - Published: ${video.isPublished ? 'Yes' : 'No'}`);
            console.log(`   - Tags: ${video.tags.join(', ')}`);
            console.log('');
        });
        console.log(`🎬 All videos are now available in the Resources section!`);
        console.log(`📱 Students can watch these videos in the embedded YouTube player`);
    }
    catch (error) {
        console.error('Error seeding YouTube videos:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};
if (require.main === module) {
    seedYouTubeVideos();
}
exports.default = seedYouTubeVideos;
//# sourceMappingURL=seedYouTubeVideos.js.map