// controllers/categoryController.js
import CategoryModel from "../models/Category.js";
import sequelize from "../config/db.js";

const Category = CategoryModel(sequelize);

// Хелпер для обработки ошибок 404
const handleNotFoundError = (res, item, itemName) => {
    if (!item) {
        res.status(404).json({ message: `${itemName} не найдена.` });
        return true;
    }
    return false;
};

// 1. Получить все категории
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            order: [["name", "ASC"]],
        });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({
            message: "Ошибка сервера при получении категорий.",
            error: error.message,
        });
    }
};

// 2. Получить категорию по ID
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (handleNotFoundError(res, category, "Категория")) return;

        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({
            message: "Ошибка сервера при получении категории по ID.",
            error: error.message,
        });
    }
};

// 3. Создать категорию
export const createCategory = async (req, res) => {
    try {
        const newCategory = await Category.create(req.body);
        res.status(201).json(newCategory);
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res
                .status(400)
                .json({ message: "Категория с таким именем уже существует." });
        }
        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                message: "Ошибка валидации данных.",
                errors: error.errors,
            });
        }
        res.status(500).json({
            message: "Ошибка сервера при создании категории.",
            error: error.message,
        });
    }
};

// 4. Обновить категорию
export const updateCategory = async (req, res) => {
    try {
        const [updatedRows] = await Category.update(req.body, {
            where: { id: req.params.id },
        });

        if (updatedRows === 0) {
            return res.status(404).json({
                message: "Категория не найдена или нет новых данных для обновления.",
            });
        }

        const updatedCategory = await Category.findByPk(req.params.id);
        res.status(200).json(updatedCategory);
    } catch (error) {
        res.status(500).json({
            message: "Ошибка сервера при обновлении категории.",
            error: error.message,
        });
    }
};

// 5. Удалить категорию
export const deleteCategory = async (req, res) => {
    try {
        const deletedRowCount = await Category.destroy({
            where: { id: req.params.id },
        });

        if (deletedRowCount === 0) {
            return res.status(404).json({ message: "Категория не найдена." });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({
            message: "Ошибка сервера при удалении категории.",
            error: error.message,
        });
    }
};
