"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Screening_1 = __importDefault(require("../models/Screening"));
const User_1 = __importDefault(require("../models/User"));
const seedScreenings = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/psychological_intervention?authSource=admin';
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        const students = await User_1.default.find({ role: 'student' });
        console.log(`Found ${students.length} students`);
        if (students.length === 0) {
            console.log('No students found. Please run seedUsers first.');
            return;
        }
        const phq9Questions = [
            { id: 'phq9_1', text: 'Little interest or pleasure in doing things', weight: 1 },
            { id: 'phq9_2', text: 'Feeling down, depressed, or hopeless', weight: 1 },
            { id: 'phq9_3', text: 'Trouble falling or staying asleep, or sleeping too much', weight: 1 },
            { id: 'phq9_4', text: 'Feeling tired or having little energy', weight: 1 },
            { id: 'phq9_5', text: 'Poor appetite or overeating', weight: 1 },
            { id: 'phq9_6', text: 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down', weight: 1 },
            { id: 'phq9_7', text: 'Trouble concentrating on things, such as reading the newspaper or watching television', weight: 1 },
            { id: 'phq9_8', text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual', weight: 1 },
            { id: 'phq9_9', text: 'Thoughts that you would be better off dead, or of hurting yourself', weight: 1 }
        ];
        const gad7Questions = [
            { id: 'gad7_1', text: 'Feeling nervous, anxious, or on edge', weight: 1 },
            { id: 'gad7_2', text: 'Not being able to stop or control worrying', weight: 1 },
            { id: 'gad7_3', text: 'Worrying too much about different things', weight: 1 },
            { id: 'gad7_4', text: 'Trouble relaxing', weight: 1 },
            { id: 'gad7_5', text: 'Being so restless that it is hard to sit still', weight: 1 },
            { id: 'gad7_6', text: 'Becoming easily annoyed or irritable', weight: 1 },
            { id: 'gad7_7', text: 'Feeling afraid as if something awful might happen', weight: 1 }
        ];
        const pss10Questions = [
            { id: 'pss10_1', text: 'In the last month, how often have you been upset because of something that happened unexpectedly?', weight: 1 },
            { id: 'pss10_2', text: 'In the last month, how often have you felt that you were unable to control the important things in your life?', weight: 1 },
            { id: 'pss10_3', text: 'In the last month, how often have you felt nervous and stressed?', weight: 1 },
            { id: 'pss10_4', text: 'In the last month, how often have you felt confident about your ability to handle your personal problems?', weight: -1 },
            { id: 'pss10_5', text: 'In the last month, how often have you felt that things were going your way?', weight: -1 },
            { id: 'pss10_6', text: 'In the last month, how often have you found that you could not cope with all the things that you had to do?', weight: 1 },
            { id: 'pss10_7', text: 'In the last month, how often have you been able to control irritations in your life?', weight: -1 },
            { id: 'pss10_8', text: 'In the last month, how often have you felt that you were on top of things?', weight: -1 },
            { id: 'pss10_9', text: 'In the last month, how often have you been angered because of things that were outside of your control?', weight: 1 },
            { id: 'pss10_10', text: 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?', weight: 1 }
        ];
        const dass21Questions = [
            { id: 'dass21_1', text: 'I found it hard to wind down', weight: 1 },
            { id: 'dass21_2', text: 'I was aware of dryness of my mouth', weight: 1 },
            { id: 'dass21_3', text: 'I couldnt seem to experience any positive feeling at all', weight: 1 },
            { id: 'dass21_4', text: 'I experienced breathing difficulty (e.g., excessively rapid breathing, breathlessness in the absence of physical exertion)', weight: 1 },
            { id: 'dass21_5', text: 'I found it difficult to work up the initiative to do things', weight: 1 },
            { id: 'dass21_6', text: 'I tended to over-react to situations', weight: 1 },
            { id: 'dass21_7', text: 'I experienced trembling (e.g., in the hands)', weight: 1 },
            { id: 'dass21_8', text: 'I felt that I was using a lot of nervous energy', weight: 1 },
            { id: 'dass21_9', text: 'I was worried about situations in which I might panic and make a fool of myself', weight: 1 },
            { id: 'dass21_10', text: 'I felt that I had nothing to look forward to', weight: 1 },
            { id: 'dass21_11', text: 'I found myself getting agitated', weight: 1 },
            { id: 'dass21_12', text: 'I found it difficult to relax', weight: 1 },
            { id: 'dass21_13', text: 'I felt down-hearted and blue', weight: 1 },
            { id: 'dass21_14', text: 'I was intolerant of anything that kept me from getting on with what I was doing', weight: 1 },
            { id: 'dass21_15', text: 'I felt I was close to panic', weight: 1 },
            { id: 'dass21_16', text: 'I was unable to become enthusiastic about anything', weight: 1 },
            { id: 'dass21_17', text: 'I felt I wasnt worth much as a person', weight: 1 },
            { id: 'dass21_18', text: 'I felt that I was rather touchy', weight: 1 },
            { id: 'dass21_19', text: 'I was aware of the action of my heart in the absence of physical exertion (e.g., sense of heart rate increase, heart missing a beat)', weight: 1 },
            { id: 'dass21_20', text: 'I felt scared without any good reason', weight: 1 },
            { id: 'dass21_21', text: 'I felt that life was meaningless', weight: 1 }
        ];
        const screeningTypes = [
            { type: 'PHQ9', questions: phq9Questions, maxScore: 27 },
            { type: 'GAD7', questions: gad7Questions, maxScore: 21 },
            { type: 'PSS10', questions: pss10Questions, maxScore: 40 },
            { type: 'DASS21', questions: dass21Questions, maxScore: 63 }
        ];
        const createdScreenings = [];
        for (const student of students) {
            const numScreenings = Math.floor(Math.random() * 3) + 2;
            for (let i = 0; i < numScreenings; i++) {
                const screeningType = screeningTypes[Math.floor(Math.random() * screeningTypes.length)];
                const responses = [];
                let totalScore = 0;
                for (const question of screeningType.questions) {
                    let score;
                    if (question.weight === -1) {
                        score = Math.floor(Math.random() * 4);
                    }
                    else {
                        score = Math.floor(Math.random() * 4);
                    }
                    responses.push({
                        questionId: question.id,
                        score: score
                    });
                    totalScore += question.weight === -1 ? (3 - score) : score;
                }
                let severity;
                const percentage = (totalScore / screeningType.maxScore) * 100;
                if (percentage < 20) {
                    severity = 'minimal';
                }
                else if (percentage < 40) {
                    severity = 'mild';
                }
                else if (percentage < 60) {
                    severity = 'moderate';
                }
                else if (percentage < 80) {
                    severity = 'moderately_severe';
                }
                else {
                    severity = 'severe';
                }
                const screening = new Screening_1.default({
                    userId: student._id,
                    type: screeningType.type,
                    responses: responses,
                    totalScore: totalScore,
                    severity: severity
                });
                await screening.save();
                createdScreenings.push(screening);
            }
        }
        console.log(`\n✅ Created ${createdScreenings.length} screening records`);
        console.log(`📊 Screening breakdown:`);
        const breakdown = createdScreenings.reduce((acc, screening) => {
            acc[screening.type] = (acc[screening.type] || 0) + 1;
            return acc;
        }, {});
        Object.entries(breakdown).forEach(([type, count]) => {
            console.log(`   ${type}: ${count} screenings`);
        });
        const severityBreakdown = createdScreenings.reduce((acc, screening) => {
            acc[screening.severity] = (acc[screening.severity] || 0) + 1;
            return acc;
        }, {});
        console.log(`📈 Severity breakdown:`);
        Object.entries(severityBreakdown).forEach(([severity, count]) => {
            console.log(`   ${severity}: ${count} screenings`);
        });
    }
    catch (error) {
        console.error('Error seeding screenings:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};
if (require.main === module) {
    seedScreenings();
}
exports.default = seedScreenings;
//# sourceMappingURL=seedScreenings.js.map