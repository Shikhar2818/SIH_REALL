"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ForumPost_1 = __importDefault(require("../models/ForumPost"));
const checkPostCounts = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        const totalPosts = await ForumPost_1.default.countDocuments();
        console.log(`📊 Total Forum Posts: ${totalPosts}`);
        const approvedPosts = await ForumPost_1.default.countDocuments({ isApproved: true });
        console.log(`✅ Approved Posts: ${approvedPosts}`);
        const pendingPosts = await ForumPost_1.default.countDocuments({ isApproved: false });
        console.log(`⏳ Pending Posts: ${pendingPosts}`);
        const postsWithoutApproval = await ForumPost_1.default.countDocuments({
            $or: [
                { isApproved: { $exists: false } },
                { isApproved: null }
            ]
        });
        console.log(`❓ Posts without approval field: ${postsWithoutApproval}`);
        const approvalStats = await ForumPost_1.default.aggregate([
            {
                $group: {
                    _id: '$isApproved',
                    count: { $sum: 1 }
                }
            }
        ]);
        console.log('\n📈 Approval Status Breakdown:');
        approvalStats.forEach(stat => {
            const status = stat._id === null ? 'null' : stat._id === true ? 'approved' : stat._id === false ? 'pending' : 'unknown';
            console.log(`   ${status}: ${stat.count}`);
        });
        console.log('\n📝 Sample Posts:');
        const samplePosts = await ForumPost_1.default.find({}).limit(5).select('title isApproved createdAt');
        samplePosts.forEach((post, index) => {
            console.log(`   ${index + 1}. "${post.title}" - Approved: ${post.isApproved} - Created: ${post.createdAt}`);
        });
    }
    catch (error) {
        console.error('❌ Error checking post counts:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};
checkPostCounts();
//# sourceMappingURL=checkPostCounts.js.map