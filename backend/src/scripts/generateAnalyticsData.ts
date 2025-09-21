import mongoose from 'mongoose';
import User from '../models/User';
import Booking from '../models/Booking';
import Screening from '../models/Screening';
import ForumPost from '../models/ForumPost';
import Counsellor from '../models/Counsellor';

const generateAnalyticsData = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get existing users
    const students = await User.find({ role: 'student' });
    const counsellors = await Counsellor.find({});
    const admins = await User.find({ role: 'admin' });

    if (students.length === 0) {
      console.log('❌ No students found. Please run seedUsers.ts first.');
      return;
    }

    if (counsellors.length === 0) {
      console.log('❌ No counsellors found. Please run seedUsers.ts first.');
      return;
    }

    console.log(`📊 Found ${students.length} students, ${counsellors.length} counsellors, ${admins.length} admins`);

    // Generate test bookings with various statuses and counsellor notes
    const bookingStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];
    const counsellorNotes = [
      'Student showed great improvement in managing anxiety.',
      'Recommended follow-up session next week.',
      'Student cancelled due to personal emergency.',
      'No show - will follow up with student.',
      'Excellent progress in coping strategies.',
      'Student needs additional support resources.',
      'Session completed successfully.',
      'Student requested rescheduling.',
      'Initial consultation went well.',
      'Student seems to be doing better this week.'
    ];

    const testBookings = [];
    const today = new Date();
    
    for (let i = 0; i < 50; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const counsellor = counsellors[Math.floor(Math.random() * counsellors.length)];
      const status = bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const slotStart = new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);

      const booking = {
        studentId: student._id,
        counsellorId: counsellor._id,
        slotStart: slotStart,
        slotEnd: new Date(slotStart.getTime() + 60 * 60 * 1000), // 1 hour session
        status: status,
        notes: `Test booking ${i + 1}`,
        counsellorNotes: Math.random() > 0.3 ? counsellorNotes[Math.floor(Math.random() * counsellorNotes.length)] : undefined,
        createdAt: createdAt,
        updatedAt: new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000)
      };

      testBookings.push(booking);
    }

    // Clear existing test bookings
    await Booking.deleteMany({ notes: { $regex: /^Test booking/ } });
    console.log('🗑️ Cleared existing test bookings');

    // Insert new test bookings
    await Booking.insertMany(testBookings);
    console.log(`✅ Created ${testBookings.length} test bookings`);

    // Generate test screenings
    const screeningTypes = ['PHQ9', 'GAD7', 'PSS10', 'DASS21'];
    const severities = ['minimal', 'mild', 'moderate', 'moderately_severe', 'severe'];

    const testScreenings = [];
    for (let i = 0; i < 30; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const type = screeningTypes[Math.floor(Math.random() * screeningTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      // Generate appropriate score based on severity
      let totalScore;
      switch (severity) {
        case 'minimal':
          totalScore = Math.floor(Math.random() * 5);
          break;
        case 'mild':
          totalScore = 5 + Math.floor(Math.random() * 4);
          break;
        case 'moderate':
          totalScore = 10 + Math.floor(Math.random() * 4);
          break;
        case 'moderately_severe':
          totalScore = 15 + Math.floor(Math.random() * 4);
          break;
        case 'severe':
          totalScore = 20 + Math.floor(Math.random() * 5);
          break;
        default:
          totalScore = Math.floor(Math.random() * 25);
      }

      const screening = {
        userId: student._id,
        type: type,
        totalScore: totalScore,
        severity: severity,
        responses: Array.from({ length: 9 }, (_, index) => ({
          questionId: `q${index + 1}`,
          score: Math.floor(Math.random() * 4)
        })),
        createdAt: createdAt
      };

      testScreenings.push(screening);
    }

    // Clear existing test screenings
    await Screening.deleteMany({ userId: { $in: students.map(s => s._id) } });
    console.log('🗑️ Cleared existing test screenings');

    // Insert new test screenings
    await Screening.insertMany(testScreenings);
    console.log(`✅ Created ${testScreenings.length} test screenings`);

    // Generate test forum posts with moods
    const categories = ['general', 'anxiety', 'depression', 'stress', 'support', 'achievement'];
    const moods = ['happy', 'sad', 'anxious', 'calm', 'stressed', 'overwhelmed'];
    const postTitles = [
      'Feeling overwhelmed with exams',
      'Had a great therapy session today',
      'Struggling with sleep lately',
      'Made progress in my recovery',
      'Looking for support during difficult times',
      'Celebrating small wins',
      'Need advice on managing stress',
      'Grateful for this community',
      'Feeling anxious about the future',
      'Sharing my success story'
    ];

    const testPosts = [];
    for (let i = 0; i < 25; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const mood = moods[Math.floor(Math.random() * moods.length)];
      const title = postTitles[Math.floor(Math.random() * postTitles.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      const post = {
        authorId: student._id,
        title: title,
        content: `This is a test forum post ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
        category: category,
        mood: mood,
        isApproved: Math.random() > 0.2, // 80% approved
        likes: [],
        comments: [],
        createdAt: createdAt
      };

      testPosts.push(post);
    }

    // Clear existing test forum posts
    await ForumPost.deleteMany({ content: { $regex: /^This is a test forum post/ } });
    console.log('🗑️ Cleared existing test forum posts');

    // Insert new test forum posts
    await ForumPost.insertMany(testPosts);
    console.log(`✅ Created ${testPosts.length} test forum posts`);

    // Show summary
    const totalBookings = await Booking.countDocuments();
    const totalScreenings = await Screening.countDocuments();
    const totalPosts = await ForumPost.countDocuments();

    console.log(`\n📊 Analytics Data Summary:`);
    console.log(`   Total Bookings: ${totalBookings}`);
    console.log(`   Total Screenings: ${totalScreenings}`);
    console.log(`   Total Forum Posts: ${totalPosts}`);
    console.log(`   Students: ${students.length}`);
    console.log(`   Counsellors: ${counsellors.length}`);
    console.log(`   Admins: ${admins.length}`);

    console.log(`\n🎉 Analytics data generation complete!`);
    console.log(`📱 Check the admin analytics dashboard for real-time data`);

  } catch (error) {
    console.error('Error generating analytics data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

generateAnalyticsData();
