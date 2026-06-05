import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController';
import protect, { authorize } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/', getUsers);
router.post('/', upload.single('profileImage'), createUser);
router.put('/:id', upload.single('profileImage'), updateUser);
router.delete('/:id', deleteUser);

export default router;
