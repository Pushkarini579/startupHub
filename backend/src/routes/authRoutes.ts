import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController';
import protect from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = Router();

router.post('/register', upload.single('profileImage'), register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);

export default router;
