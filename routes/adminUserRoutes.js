import express from 'express';
import * as userController from '../controllers/userController.js';
// В реальном приложении здесь должна быть authMiddleware и adminMiddleware
// import { authMiddleware } from '../middlewares/authMiddleware.js'; 
// import { adminMiddleware } from '../middlewares/adminMiddleware.js'; 

const router = express.Router();

// GET /api/admin/users - Получить всех пользователей (Админ)
// В реальном приложении: router.get('/', authMiddleware, adminMiddleware, userController.getAllUsers);
router.get('/', userController.getAllUsers);

// POST /api/admin/users/manage - Обновление статуса/пароля пользователя (Админ)
// В реальном приложении: router.post('/manage', authMiddleware, adminMiddleware, userController.manageUser);
router.post('/manage', userController.manageUser);

// POST /api/admin/users/delete - Удалить пользователя (Админ)
// В реальном приложении: router.post('/delete', authMiddleware, adminMiddleware, userController.deleteUser);
router.post('/delete', userController.deleteUser);

export default router;