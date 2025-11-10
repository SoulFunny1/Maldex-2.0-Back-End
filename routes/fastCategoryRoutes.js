// routes/fastCategoryRoutes.js
import express from 'express';
// !!! ИСПРАВЛЕНО: Убедитесь, что controllers/fastCategoryController.js существует
import * as fastCategoryController from '../controllers/fastCategoryController.js'; 

const router = express.Router();

// GET /api/fast-categories - Получить все категории
router.get('/', fastCategoryController.getAllCategories);

// POST /api/fast-categories - Создать новую категорию
router.post('/', fastCategoryController.createCategory);

// GET /api/fast-categories/:id - Получить категорию по ID
router.get('/:id', fastCategoryController.getCategoryById);

// PUT /api/fast-categories/:id - Обновить категорию по ID
router.put('/:id', fastCategoryController.updateCategory);

// DELETE /api/fast-categories/:id - Удалить категорию по ID
router.delete('/:id', fastCategoryController.deleteCategory);

export default router;