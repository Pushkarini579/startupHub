import { Router } from 'express';
import { getNews } from '../controllers/newsController';
import protect from '../middleware/authMiddleware';

const router = Router();

router.get('/', protect, getNews);

export default router;
