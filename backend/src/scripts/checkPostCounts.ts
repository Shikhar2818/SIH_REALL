import mongoose from 'mongoose';
import ForumPost from '../models/ForumPost';

const checkPostCounts = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check total posts
    const totalPosts = await ForumPost.countDocuments();
    console.log(`📊 Total Forum Posts: ${totalPosts}`);

    // Check approved posts
    const approvedPosts = await ForumPost.countDocuments({ isApproved: true });
    console.log(`✅ Approved Posts: ${approvedPosts}`);

    // Check pending posts
    const pendingPosts = await ForumPost.countDocuments({ isApproved: false });
    console.log(`⏳ Pending Posts: ${pendingPosts}`);

    // Check posts without approval field (might be null/undefined)
    const postsWithoutApproval = await ForumPost.countDocuments({ 
      $or: [
        { isApproved: { $exists: false } },
        { isApproved: null }
      ]
    });
    console.log(`❓ Posts without approval field: ${postsWithoutApproval}`);

    // Check posts by approval status
    const approvalStats = await ForumPost.aggregate([
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

    // Sample a few posts to see their structure
    console.log('\n📝 Sample Posts:');
    const samplePosts = await ForumPost.find({}).limit(5).select('title isApproved createdAt');
    samplePosts.forEach((post, index) => {
      console.log(`   ${index + 1}. "${post.title}" - Approved: ${post.isApproved} - Created: ${post.createdAt}`);
    });

  } catch (error) {
    console.error('❌ Error checking post counts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

checkPostCounts();
