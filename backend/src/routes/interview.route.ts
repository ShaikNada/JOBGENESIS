import { Router } from 'express';
import { generateInitialQuestion, evaluateResponse } from '../controllers/interview.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Routes for the AI Audio Interview Phase
// Protect requires the user to be logged in
router.post('/start', protect, generateInitialQuestion);
router.post('/evaluate', protect, evaluateResponse);

export default router;
