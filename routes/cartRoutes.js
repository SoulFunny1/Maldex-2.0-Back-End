// /routes/cartRoutes.js

import { Router } from 'express';
import { 
    getCart, 
    addItemToCart, 
    updateCartItemQuantity, 
    removeItemFromCart, 
    clearCart 
} from '../controllers/cartController.js';

// ⚠️ Предполагаем, что у вас есть middleware для проверки авторизации
// и добавления user.id в req.user.id (например, authMiddleware)
const authMiddleware = (req, res, next) => {
    // 🚧 Здесь должна быть ваша реальная логика аутентификации.
    // Для примера, используем жестко заданный ID.
    req.user = { id: 1 }; 
    next(); 
};

const router = Router();

// Все маршруты требуют аутентификации
router.use(authMiddleware); 

// Получить содержимое корзины
router.get('/', getCart);

// Добавить или обновить товар (количество)
router.post('/add', addItemToCart);

// Изменить количество (или удалить, если quantity <= 0)
router.put('/update', updateCartItemQuantity);

// Удалить конкретный вариант товара (по размеру/цвету)
router.delete('/remove', removeItemFromCart);

// Очистить всю корзину
router.delete('/clear', clearCart);


export default router;