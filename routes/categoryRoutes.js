// routes/categoryRoutes.js
import express from 'express';
// Или const express = require('express'); если вы не используете ES Modules
import * as categoryController from '../controllers/categoryController.js'; 
// Или const categoryController = require('../controllers/categoryController.js');

const router = express.Router();

// GET /api/categories - Получить все категории
router.get('/', categoryController.getAllCategories);

// POST /api/categories - Создать новую категорию
router.post('/', categoryController.createCategory);

// GET /api/categories/:id - Получить категорию по ID
router.get('/:id', categoryController.getCategoryById);

// PUT /api/categories/:id - Обновить категорию по ID
router.put('/:id', categoryController.updateCategory);

// DELETE /api/categories/:id - Удалить категорию по ID
router.delete('/:id', categoryController.deleteCategory);

export default router;
// Или module.exports = router;