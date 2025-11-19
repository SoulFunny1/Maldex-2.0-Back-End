import express from 'express';
// Убедитесь, что этот путь к контроллеру верный
import { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    getProductsByCategory
} from '../controllers/allProductController.js'; 

const router = express.Router();

// ВНИМАНИЕ: Маршруты начинаются с простого '/' или ':id', 
// потому что префикс '/api/admin/products' уже задан в server.js

// === READ маршруты ===
// GET /api/admin/products/
router.get('/', getProducts);          

router.get('/category/:category', getProductsByCategory);

// GET /api/admin/products/:id
router.get('/:id', getProductById);   

// === CRUD маршруты (соответствующие REST) ===
// POST /api/admin/products/
router.post('/', createProduct);        

// PUT /api/admin/products/:id  <-- ЭТО ИСПРАВЛЯЕТ ВАШУ ПЕРВОНАЧАЛЬНУЮ И ТЕКУЩУЮ ОШИБКИ
router.put('/:id', updateProduct);     

// DELETE /api/admin/products/:id
router.delete('/:id', deleteProduct);  

export default router;