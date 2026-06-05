import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  getAssignees,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController';
import protect from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = Router();

router.use(protect);

router.get('/', getProjects);
router.get('/assignees', getAssignees);
router.get('/:id', getProjectById);
router.post('/', upload.single('attachment'), createProject);
router.put('/:id', upload.single('attachment'), updateProject);
router.delete('/:id', deleteProject);

export default router;
