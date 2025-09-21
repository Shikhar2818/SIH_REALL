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
  } else if (type === 'PSS10') {
    res.json({
      type: 'PSS10',
      title: 'Perceived Stress Scale-10 (PSS-10)',
      description: 'The questions in this scale ask you about your feelings and thoughts during the last month.',
      questions: [
        { id: 'pss10_1', text: 'In the last month, how often have you been upset because of something that happened unexpectedly?' },
        { id: 'pss10_2', text: 'In the last month, how often have you felt that you were unable to control the important things in your life?' },
        { id: 'pss10_3', text: 'In the last month, how often have you felt nervous and stressed?' },
        { id: 'pss10_4', text: 'In the last month, how often have you felt confident about your ability to handle your personal problems?' },
        { id: 'pss10_5', text: 'In the last month, how often have you felt that things were going your way?' },
        { id: 'pss10_6', text: 'In the last month, how often have you found that you could not cope with all the things that you had to do?' },
        { id: 'pss10_7', text: 'In the last month, how often have you been able to control irritations in your life?' },
        { id: 'pss10_8', text: 'In the last month, how often have you felt that you were on top of things?' },
        { id: 'pss10_9', text: 'In the last month, how often have you been angered because of things that were outside of your control?' },
        { id: 'pss10_10', text: 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?' }
      ],
      options: [
        { value: 0, label: 'Never' },
        { value: 1, label: 'Almost Never' },
        { value: 2, label: 'Sometimes' },
        { value: 3, label: 'Fairly Often' },
        { value: 4, label: 'Very Often' },
      ],
    });
  } else if (type === 'DASS21') {
    res.json({
      type: 'DASS21',
      title: 'Depression, Anxiety, Stress Scale-21 (DASS-21)',
      description: 'Please read each statement and circle a number 0, 1, 2 or 3 which indicates how much the statement applied to you over the past week.',
      questions: [
        { id: 'dass21_1', text: 'I found it hard to wind down' },
        { id: 'dass21_2', text: 'I was aware of dryness of my mouth' },
        { id: 'dass21_3', text: 'I couldnt seem to experience any positive feeling at all' },
        { id: 'dass21_4', text: 'I experienced breathing difficulty (e.g., excessively rapid breathing, breathlessness in the absence of physical exertion)' },
        { id: 'dass21_5', text: 'I found it difficult to work up the initiative to do things' },
        { id: 'dass21_6', text: 'I tended to over-react to situations' },
        { id: 'dass21_7', text: 'I experienced trembling (e.g., in the hands)' },
        { id: 'dass21_8', text: 'I felt that I was using a lot of nervous energy' },
        { id: 'dass21_9', text: 'I was worried about situations in which I might panic and make a fool of myself' },
        { id: 'dass21_10', text: 'I felt that I had nothing to look forward to' },
        { id: 'dass21_11', text: 'I found myself getting agitated' },
        { id: 'dass21_12', text: 'I found it difficult to relax' },
        { id: 'dass21_13', text: 'I felt down-hearted and blue' },
        { id: 'dass21_14', text: 'I was intolerant of anything that kept me from getting on with what I was doing' },
        { id: 'dass21_15', text: 'I felt I was close to panic' },
        { id: 'dass21_16', text: 'I was unable to become enthusiastic about anything' },
        { id: 'dass21_17', text: 'I felt I wasnt worth much as a person' },
        { id: 'dass21_18', text: 'I felt that I was rather touchy' },
        { id: 'dass21_19', text: 'I was aware of the action of my heart in the absence of physical exertion (e.g., sense of heart rate increase, heart missing a beat)' },
        { id: 'dass21_20', text: 'I felt scared without any good reason' },
        { id: 'dass21_21', text: 'I felt that life was meaningless' }
      ],
      options: [
        { value: 0, label: 'Did not apply to me at all' },
        { value: 1, label: 'Applied to me to some degree, or some of the time' },
        { value: 2, label: 'Applied to me to a considerable degree, or a good part of the time' },
        { value: 3, label: 'Applied to me very much, or most of the time' },
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
