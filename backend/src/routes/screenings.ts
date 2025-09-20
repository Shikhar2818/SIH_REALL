import express from 'express';
import { body, validationResult } from 'express-validator';
import Screening from '../models/Screening';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import NotificationService from '../services/notificationService';

const router = express.Router();

// PHQ-9 questions
const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself - or that you are a failure or have let yourself or your family down',
  'Trouble concentrating on things, such as reading the newspaper or watching television',
  'Moving or speaking so slowly that other people could have noticed, or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
  'Thoughts that you would be better off dead, or of hurting yourself',
];

// GAD-7 questions
const GAD7_QUESTIONS = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid, as if something awful might happen',
];

const calculatePHQ9Severity = (score: number): string => {
  if (score <= 4) return 'minimal';
  if (score <= 9) return 'mild';
  if (score <= 14) return 'moderate';
  if (score <= 19) return 'moderately_severe';
  return 'severe';
};

const calculateGAD7Severity = (score: number): string => {
  if (score <= 4) return 'minimal';
  if (score <= 9) return 'mild';
  if (score <= 14) return 'moderate';
  return 'severe';
};

// Submit screening
router.post('/', [
  authenticateToken,
  body('type').isIn(['PHQ9', 'GAD7']).withMessage('Type must be PHQ9 or GAD7'),
  body('responses').isArray({ min: 1 }).withMessage('Responses array required'),
  body('responses.*.questionId').notEmpty().withMessage('Question ID required'),
  body('responses.*.score').isInt({ min: 0, max: 3 }).withMessage('Score must be 0-3'),
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, responses } = req.body;

    // Validate responses match expected questions
    const expectedQuestions = type === 'PHQ9' ? PHQ9_QUESTIONS : GAD7_QUESTIONS;
    if (responses.length !== expectedQuestions.length) {
      return res.status(400).json({ 
        error: `Expected ${expectedQuestions.length} responses for ${type}` 
      });
    }

    // Calculate total score
    const totalScore = responses.reduce((sum: number, response: any) => sum + response.score, 0);

    // Determine severity
    const severity = type === 'PHQ9' 
      ? calculatePHQ9Severity(totalScore)
      : calculateGAD7Severity(totalScore);

    // Create screening record
    const screening = new Screening({
      userId: req.user!.id,
      type,
      responses,
      totalScore,
      severity,
    });

    await screening.save();

    // Create mental health alert for severe cases
    if (severity === 'moderately_severe' || severity === 'severe') {
      await NotificationService.createMentalHealthAlert(
        screening._id.toString(),
        severity,
        req.user!.id
      );
    }

    res.status(201).json({
      message: 'Screening submitted successfully',
      screening: {
        id: screening._id,
        type: screening.type,
        totalScore: screening.totalScore,
        severity: screening.severity,
        createdAt: screening.createdAt,
      },
    });
  } catch (error) {
    console.error('Screening submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's screening history
router.get('/history', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const screenings = await Screening.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .select('-responses');

    res.json({ screenings });
  } catch (error) {
    console.error('Get screening history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get screening questions
router.get('/questions/:type', (req, res) => {
  const { type } = req.params;

  if (type === 'PHQ9') {
    res.json({
      type: 'PHQ9',
      title: 'Patient Health Questionnaire-9 (PHQ-9)',
      description: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
      questions: PHQ9_QUESTIONS.map((question, index) => ({
        id: `phq9_${index + 1}`,
        text: question,
      })),
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' },
      ],
    });
  } else if (type === 'GAD7') {
    res.json({
      type: 'GAD7',
      title: 'Generalized Anxiety Disorder-7 (GAD-7)',
      description: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
      questions: GAD7_QUESTIONS.map((question, index) => ({
        id: `gad7_${index + 1}`,
        text: question,
      })),
      options: [
        { value: 0, label: 'Not at all' },
        { value: 1, label: 'Several days' },
        { value: 2, label: 'More than half the days' },
        { value: 3, label: 'Nearly every day' },
      ],
    });
  } else {
    res.status(400).json({ error: 'Invalid screening type' });
  }
});

// Get anonymized screening summary (admin only)
router.get('/summary', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // In a real app, you'd check if user is admin
    // For now, we'll allow any authenticated user to see summary
    
    const phq9Stats = await Screening.aggregate([
      { $match: { type: 'PHQ9' } },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 },
          avgScore: { $avg: '$totalScore' },
        },
      },
    ]);

    const gad7Stats = await Screening.aggregate([
      { $match: { type: 'GAD7' } },
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 },
          avgScore: { $avg: '$totalScore' },
        },
      },
    ]);

    const totalScreenings = await Screening.countDocuments();
    const recentScreenings = await Screening.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    res.json({
      totalScreenings,
      recentScreenings,
      phq9Stats,
      gad7Stats,
    });
  } catch (error) {
    console.error('Get screening summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
