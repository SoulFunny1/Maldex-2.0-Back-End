// /controllers/cartController.js

import models from '../models/cartItem.js'; // Путь к вашим моделям
const { CartItem, Product } = models;

// Helper для получения полной корзины
const getFullCart = async (userId) => {
    return await CartItem.findAll({
        where: { UserId: userId },
        attributes: ['size', 'color', 'quantity'], // Что хотим видеть в ответе
        include: {
            model: Product,
            attributes: ['id', 'mainArticul', 'name', 'price', 'productData'], // Данные товара
        }
    });
};

// -------------------------------------------------------------
// GET /api/cart - Получить содержимое корзины
// -------------------------------------------------------------
export const getCart = async (req, res) => {
    // ⚠️ Предполагаем, что req.user.id доступен после аутентификации
    const userId = req.user.id; 
    
    try {
        const cart = await getFullCart(userId);
        
        // Форматирование для фронтенда и расчет общей суммы
        const formattedCart = cart.map(item => {
            const product = item.Product;
            const itemPrice = parseFloat(item.dataValues.priceAtTimeOfOrder || product.price);
            
            return {
                id: product.id,
                mainArticul: product.mainArticul,
                name: product.name,
                size: item.size,
                color: item.color,
                quantity: item.quantity,
                unitPrice: itemPrice,
                totalItemPrice: itemPrice * item.quantity,
                // Дополнительные данные, если нужны:
                imgUrl: product.productData?.img?.[0] || 'default_url',
            };
        });

        const totalSum = formattedCart.reduce((sum, item) => sum + item.totalItemPrice, 0);

        res.status(200).json({
            items: formattedCart,
            totalItems: formattedCart.length,
            totalSum: totalSum.toFixed(2)
        });
    } catch (error) {
        console.error('Ошибка получения корзины:', error);
        res.status(500).json({ message: 'Ошибка сервера при загрузке корзины.' });
    }
};

// -------------------------------------------------------------
// POST /api/cart/add - Добавить/Обновить товар в корзине
// -------------------------------------------------------------
export const addItemToCart = async (req, res) => {
    const userId = req.user.id; 
    const { productId, size, color, quantity = 1 } = req.body;
    
    if (!productId || !size || !color || quantity < 1) {
        return res.status(400).json({ message: 'Необходимо указать productId, size, color и quantity (>= 1).' });
    }

    try {
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: 'Товар не найден.' });
        }
        
        const currentPrice = parseFloat(product.price);
        
        // Создаем или обновляем элемент корзины (upsert logic)
        const [cartItem, created] = await CartItem.findOrCreate({
            where: {
                UserId: userId,
                ProductId: productId,
                size: size,
                color: color,
            },
            defaults: {
                quantity: quantity,
                priceAtTimeOfOrder: currentPrice, // Фиксируем цену
            }
        });

        if (!created) {
            // Если элемент уже существует, обновляем количество
            cartItem.quantity += quantity; 
            await cartItem.save();
        }

        res.status(200).json({ 
            message: created ? 'Товар добавлен в корзину.' : 'Количество товара в корзине обновлено.',
            item: { productId, size, color, quantity: cartItem.quantity } 
        });

    } catch (error) {
        console.error('Ошибка добавления/обновления корзины:', error);
        res.status(500).json({ message: 'Ошибка сервера при работе с корзиной.' });
    }
};

// -------------------------------------------------------------
// PUT /api/cart/update - Изменить количество или удалить
// -------------------------------------------------------------
export const updateCartItemQuantity = async (req, res) => {
    const userId = req.user.id;
    const { productId, size, color, newQuantity } = req.body;

    if (!productId || !size || !color || newQuantity === undefined) {
        return res.status(400).json({ message: 'Необходимо указать productId, size, color и newQuantity.' });
    }

    try {
        const cartItem = await CartItem.findOne({
            where: { UserId: userId, ProductId: productId, size, color }
        });

        if (!cartItem) {
            return res.status(404).json({ message: 'Элемент корзины не найден.' });
        }

        if (newQuantity <= 0) {
            // Если количество равно 0 или меньше, удаляем элемент
            await cartItem.destroy();
            return res.status(200).json({ message: 'Товар удален из корзины.' });
        }

        // Обновляем количество
        cartItem.quantity = newQuantity;
        await cartItem.save();

        res.status(200).json({ message: 'Количество товара обновлено.', item: cartItem });
    } catch (error) {
        console.error('Ошибка обновления корзины:', error);
        res.status(500).json({ message: 'Ошибка сервера при обновлении корзины.' });
    }
};

// -------------------------------------------------------------
// DELETE /api/cart/remove - Удалить конкретный вариант товара
// -------------------------------------------------------------
export const removeItemFromCart = async (req, res) => {
    const userId = req.user.id;
    const { productId, size, color } = req.body; // Используем body для DELETE с данными

    if (!productId || !size || !color) {
        return res.status(400).json({ message: 'Необходимо указать productId, size и color.' });
    }

    try {
        const deletedCount = await CartItem.destroy({
            where: { UserId: userId, ProductId: productId, size, color }
        });

        if (deletedCount === 0) {
            return res.status(404).json({ message: 'Товар с указанными параметрами не найден в корзине.' });
        }

        res.status(200).json({ message: 'Товар удален из корзины.' });
    } catch (error) {
        console.error('Ошибка удаления товара из корзины:', error);
        res.status(500).json({ message: 'Ошибка сервера при удалении товара.' });
    }
};

// -------------------------------------------------------------
// DELETE /api/cart/clear - Очистить всю корзину
// -------------------------------------------------------------
export const clearCart = async (req, res) => {
    const userId = req.user.id; 
    
    try {
        await CartItem.destroy({ where: { UserId: userId } });
        res.status(200).json({ message: 'Корзина успешно очищена.' });
    } catch (error) {
        console.error('Ошибка очистки корзины:', error);
        res.status(500).json({ message: 'Ошибка сервера при очистке корзины.' });
    }
};