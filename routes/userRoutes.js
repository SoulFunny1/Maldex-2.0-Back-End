import express from 'express';
import * as userController from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js'; // добавь этот импорт

const router = express.Router();

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/logout', userController.logoutUser);



// Теперь защищённый маршрут
router.get('/me', authMiddleware, userController.getCurrentUser);

export default router;
