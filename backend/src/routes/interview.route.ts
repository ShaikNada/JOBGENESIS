import { Router } from 'express';
import { startInterview, submitTurn, getInterviewSummary } from '../controllers/interview.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Routes for the AI Audio Interview Phase
router.post('/start', protect, startInterview);
router.post('/submit-turn', protect, submitTurn);
router.get('/summary/:id', protect, getInterviewSummary);

export default router;
