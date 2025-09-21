"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Resource_1 = __importDefault(require("../models/Resource"));
const updateEnglishTags = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        const result = await Resource_1.default.updateMany({ category: 'video', tags: { $nin: ['hindi'] } }, { $addToSet: { tags: 'english' } });
        console.log(`✅ Updated ${result.modifiedCount} existing videos with English tag`);
        const englishCount = await Resource_1.default.countDocuments({ category: 'video', tags: 'english' });
        const hindiCount = await Resource_1.default.countDocuments({ category: 'video', tags: 'hindi' });
        const totalCount = await Resource_1.default.countDocuments({ category: 'video' });
        console.log(`📊 Video Statistics:`);
        console.log(`   Total Videos: ${totalCount}`);
        console.log(`   English Videos: ${englishCount}`);
        console.log(`   Hindi Videos: ${hindiCount}`);
    }
    catch (error) {
        console.error('Error updating English tags:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB');
    }
};
updateEnglishTags();
//# sourceMappingURL=updateEnglishTags.js.map