import { Router } from 'express';
import { createIssue, deleteIssue, getAllIssues, getSingleIssue, updateIssue } from './issuesController.js';
import { authMiddleware, isMaintainer } from '../../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.get('/', getAllIssues);
router.get('/:id', getSingleIssue);

// Protected routes
router.post('/', authMiddleware, createIssue);
router.patch('/:id', authMiddleware, updateIssue);
router.delete('/:id', authMiddleware, isMaintainer, deleteIssue);

export default router;