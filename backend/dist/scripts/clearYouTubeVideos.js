"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Resource_1 = __importDefault(require("../models/Resource"));
const clearYouTubeVideos = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        const result = await Resource_1.default.deleteMany({ category: 'video' });
        console.log(`✅ Cleared ${result.deletedCount} existing video resources`);
        const remainingVideos = await Resource_1.default.countDocuments({ category: 'video' });
        console.log(`📊 Remaining videos in database: ${remainingVideos}`);
        console.log('🎬 All YouTube videos have been removed!');
        console.log('📝 Ready to add your custom videos.');
    }
    catch (error) {
        console.error('Error clearing YouTube videos:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
};
clearYouTubeVideos();
//# sourceMappingURL=clearYouTubeVideos.js.map