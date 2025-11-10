// routes/productRoutes.js
import express from 'express';
// Используем import * as для импорта всех именованных экспортов
import * as productController from '../controllers/productController.js'; 

const router = express.Router();

// GET /api/products - Получить все продукты
router.get('/', productController.getAllProducts);

// POST /api/products - Создать новый продукт
router.post('/', productController.createProduct);

// GET /api/products/:id - Получить продукт по ID
router.get('/:id', productController.getProductById);

// PUT /api/products/:id - Обновить продукт по ID
router.put('/:id', productController.updateProduct);

// DELETE /api/products/:id - Удалить продукт по ID
router.delete('/:id', productController.deleteProduct);

export default router;