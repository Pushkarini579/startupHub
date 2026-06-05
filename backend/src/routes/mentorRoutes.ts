import { Router } from 'express';
import {
  getMentors,
  getMentorById,
  createMentor,
  updateMentor,
  deleteMentor,
} from '../controllers/mentorController';
import protect, { authorize } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = Router();

router.use(protect);

router.get('/', getMentors);
router.get('/:id', getMentorById);

// Admin-only write actions
router.post('/', authorize('admin'), upload.single('profileImage'), createMentor);
router.put('/:id', authorize('admin'), upload.single('profileImage'), updateMentor);
router.delete('/:id', authorize('admin'), deleteMentor);

export default router;
