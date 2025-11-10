import sequelize from '../config/db.js';
import ProductModel from '../models/ProductModel.js';

const Product = ProductModel(sequelize); // ✅ инициализация модели

// Вспомогательная функция
const getProductData = (body) => ({
    articul: body.articul,
    price: body.price,
    img: Array.isArray(body.img) ? body.img : (body.img ? [body.img] : []),
    color: body.color || null,
    description: body.description,
});


// === READ OPERATIONS (GET) ===

// @desc    Получить все товары
// @route   GET /api/admin/products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            order: [['createdAt', 'DESC']] 
        });
        res.status(200).json(products);
    } catch (error) {
        console.error('Ошибка Sequelize при получении товаров:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении товаров' });
    }
};

// @desc    Получить один товар по ID
// @route   GET /api/admin/products/:id
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);

        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: 'Товар не найден' });
        }
    } catch (error) {
        console.error('Ошибка Sequelize при получении товара:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении товара' });
    }
};

// === WRITE OPERATIONS (POST) ===

// @desc    Единая функция для создания, обновления и удаления товара
// @route   POST /api/admin/products/:action?
// @access  Private (Admin only)
export const manageProduct = async (req, res) => {
    // Определяем действие: create, update, delete
    const { action } = req.params;
    const { id } = req.body; // ID для обновления и удаления
    const productData = getProductData(req.body);

    try {
        if (action === 'create') {
            // --- CREATE LOGIC ---
            const product = await Product.create(productData);
            return res.status(201).json({ message: 'Товар успешно создан', product });
        } 
        
        if (action === 'update') {
            // --- UPDATE LOGIC ---
            if (!id) {
                return res.status(400).json({ message: 'Для обновления требуется ID товара.' });
            }
            
            const [updatedRows] = await Product.update(productData, {
                where: { id },
                individualHooks: true // Запускает валидацию
            });

            if (updatedRows === 1) {
                const updatedProduct = await Product.findByPk(id);
                return res.status(200).json({ message: 'Товар успешно обновлен', product: updatedProduct });
            } else {
                return res.status(404).json({ message: 'Товар для обновления не найден' });
            }
        } 
        
        if (action === 'delete') {
            // --- DELETE LOGIC ---
            if (!id) {
                return res.status(400).json({ message: 'Для удаления требуется ID товара.' });
            }
            
            const result = await Product.destroy({
                where: { id }
            });

            if (result === 1) {
                return res.status(200).json({ message: 'Товар успешно удален' });
            } else {
                return res.status(404).json({ message: 'Товар для удаления не найден' });
            }
        }
        
        // Если action не соответствует ни одному из ожидаемых
        return res.status(400).json({ message: 'Неизвестное действие.' });

    } catch (error) {
        console.error('Ошибка при управлении товаром:', error);
        
        // Обработка ошибок валидации и уникальности
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Артикул уже занят другим товаром.' });
        }
        if (error.name === 'SequelizeValidationError') {
            const messages = error.errors.map(err => err.message);
            return res.status(400).json({ message: 'Ошибка валидации данных', details: messages });
        }

        res.status(500).json({ message: 'Ошибка сервера' });
    }
};