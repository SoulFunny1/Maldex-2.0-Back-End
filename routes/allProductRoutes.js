import express from 'express';
import { getProducts, getProductById, manageProduct } from '../controllers/productController.js';

const router = express.Router();

// GET все товары
router.get('/', getProducts);

// GET товар по ID
router.get('/:id', getProductById);

// POST действия: create, update, delete
router.post('/:action(create|update|delete)', manageProduct);

export default router;
