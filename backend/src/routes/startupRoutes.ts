import { Router } from 'express';
import {
  getStartups,
  getStartupById,
  createStartup,
  updateStartup,
  approveStartup,
  deleteStartup,
} from '../controllers/startupController';
import protect, { authorize } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = Router();

router.use(protect);

router.get('/', getStartups);
router.get('/:id', getStartupById);
router.post('/', upload.single('logo'), createStartup);
router.put('/:id', upload.single('logo'), updateStartup);
router.put('/:id/approve', authorize('admin'), approveStartup);
router.delete('/:id', deleteStartup);

export default router;
