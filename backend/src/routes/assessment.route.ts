import { Router } from 'express';
import { generateAssessment, submitAssessment } from '../controllers/assessment.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Assessment Generation and Grading
router.post('/generate', protect, generateAssessment);
router.post('/submit', protect, submitAssessment);

export default router;
