// controllers/productController.js
// Вам нужно будет адаптировать пути импорта, как и ранее.
import ProductModel from "../models/Product.js";
import sequelize from "../config/db.js";

// Инициализация модели
const Product = ProductModel(sequelize);

// Хелпер для обработки ошибок 404
const handleNotFoundError = (res, item, itemName) => {
    if (!item) {
        res.status(404).json({ message: `${itemName} не найден.` });
        return true;
    }
    return false;
};

// 1. Получить все продукты
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            order: [["name", "ASC"]],
        });
        res.status(200).json(products);
    } catch (error) {
        console.error("Ошибка при получении всех продуктов:", error);
        res.status(500).json({
            message: "Ошибка сервера при получении продуктов.",
            error: error.message,
        });
    }
};

// 2. Получить продукт по ID
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (handleNotFoundError(res, product, "Продукт")) return;

        res.status(200).json(product);
    } catch (error) {
        console.error("Ошибка при получении продукта по ID:", error);
        res.status(500).json({
            message: "Ошибка сервера при получении продукта по ID.",
            error: error.message,
        });
    }
};

// 3. Создать продукт
export const createProduct = async (req, res) => {
    try {
        // Базовая проверка обязательных полей
        if (!req.body.name || !req.body.price) {
             return res.status(400).json({ message: "Поля 'name' и 'price' обязательны." });
        }
        
        const newProduct = await Product.create(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({ message: "Продукт с таким именем уже существует." });
        }
        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                message: "Ошибка валидации данных.",
                errors: error.errors.map(err => err.message),
            });
        }
        console.error("Ошибка при создании продукта:", error);
        res.status(500).json({
            message: "Ошибка сервера при создании продукта.",
            error: error.message,
        });
    }
};

// 4. Обновить продукт
export const updateProduct = async (req, res) => {
    try {
        const [updatedRows] = await Product.update(req.body, {
            where: { id: req.params.id },
            // Возвращаем обновленный объект для PostgreSQL, но для MySQL это не требуется.
            // Для MySQL мы получим объект отдельно:
        });

        if (updatedRows === 0) {
            return res.status(404).json({
                message: "Продукт не найден или нет новых данных для обновления.",
            });
        }

        const updatedProduct = await Product.findByPk(req.params.id);
        res.status(200).json(updatedProduct);
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({ message: "Продукт с таким именем уже существует." });
        }
        console.error("Ошибка при обновлении продукта:", error);
        res.status(500).json({
            message: "Ошибка сервера при обновлении продукта.",
            error: error.message,
        });
    }
};

// 5. Удалить продукт
export const deleteProduct = async (req, res) => {
    try {
        const deletedRowCount = await Product.destroy({
            where: { id: req.params.id },
        });

        if (deletedRowCount === 0) {
            return res.status(404).json({ message: "Продукт не найден." });
        }

        res.status(204).send(); // 204 No Content
    } catch (error) {
        console.error("Ошибка при удалении продукта:", error);
        res.status(500).json({
            message: "Ошибка сервера при удалении продукта.",
            error: error.message,
        });
    }
};