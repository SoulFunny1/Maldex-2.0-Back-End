import express from 'express';
import { 
    getProducts, 
    getProductById, 
    manageProduct // Единый контроллер для POST-действий
} from '../controllers/allProductController.js';

const router = express.Router();

// === GET ROUTES (Read) ===

// GET /api/admin/products - Получить все товары
router.get('/', getProducts);

// GET /api/admin/products/:id - Получить товар по ID
router.get('/:id', getProductById); 

// === POST ROUTE (Create, Update, Delete) ===

// POST /api/admin/products/:action
// action может быть 'create', 'update', или 'delete'
// Тело запроса должно содержать данные товара и ID (для update/delete)
router.post('/:action', manageProduct);

export default router;

/*
    ПРИМЕРЫ ЗАПРОСОВ (если app.use('/api/admin/products', router) ):
    
    1. Создание:
        POST /api/admin/products/create
        Body: { articul: "A123", price: 100, description: "New item", img: "url" }

    2. Обновление:
        POST /api/admin/products/update
        Body: { id: 5, price: 150, color: "Red", img: "new-url" }

    3. Удаление:
        POST /api/admin/products/delete
        Body: { id: 5 }
        
    4. Чтение всех:
        GET /api/admin/products
*/