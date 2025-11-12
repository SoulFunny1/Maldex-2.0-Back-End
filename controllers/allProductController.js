import sequelize from '../config/db.js';
import ProductModel from '../models/ProductModel.js';

const Product = ProductModel(sequelize); // Инициализация модели

// Вспомогательная функция для форматирования данных
const getProductData = (body) => {
    const data = {
        mainArticul: body.mainArticul,
        name: body.name,
        category: body.category,
        description: body.description || null,
        price: body.price != null ? Number(body.price) : 0,
        stock: body.stock != null ? Number(body.stock) : 0,
        weight: body.weight != null ? Number(body.weight) : null,
        packageVolume: body.packageVolume != null ? Number(body.packageVolume) : null,
        quantityInPackage: body.quantityInPackage != null ? Number(body.quantityInPackage) : null,
        transportPackageType: body.transportPackageType || null,
        individualPackageType: body.individualPackageType || null,
        brandingTypes: body.brandingTypes || [],
        productData: {
            ...(body.productData || {}),
            color: body.color || null,
            img: Array.isArray(body.img) ? body.img : (body.img ? [body.img] : []),
        },
    };

    // Удаляем undefined и NaN
    Object.keys(data).forEach(key => {
        if (data[key] === undefined || (typeof data[key] === 'number' && isNaN(data[key]))) {
            delete data[key];
        }
    });

    return data;
};

// === READ ===
export const getProducts = async (req, res) => {
    try {
        const products = await Product.findAll({ order: [['createdAt', 'DESC']] });
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера при получении товаров', details: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Товар не найден' });
        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера при получении товара', details: error.message });
    }
};

// === WRITE (create/update/delete) ===
export const manageProduct = async (req, res) => {
    const { action } = req.params;
    const { id } = req.body;
    const productData = getProductData(req.body);

    try {
        if (action === 'create') {
            if (!productData.mainArticul) return res.status(400).json({ message: 'Требуется артикул (mainArticul).' });
            const product = await Product.create(productData);
            return res.status(201).json({ message: 'Товар создан', product });
        }

        if (action === 'update') {
            if (!id) return res.status(400).json({ message: 'Требуется ID товара для обновления.' });
            const [updatedRows] = await Product.update(productData, { where: { id }, individualHooks: true });
            if (updatedRows === 0) return res.status(404).json({ message: 'Товар не найден для обновления.' });
            const updatedProduct = await Product.findByPk(id);
            return res.status(200).json({ message: 'Товар обновлен', product: updatedProduct });
        }

        if (action === 'delete') {
            if (!id) return res.status(400).json({ message: 'Требуется ID товара для удаления.' });
            const deletedRows = await Product.destroy({ where: { id } });
            if (deletedRows === 0) return res.status(404).json({ message: 'Товар не найден для удаления.' });
            return res.status(200).json({ message: 'Товар удален', deletedId: id });
        }

        res.status(400).json({ message: 'Неизвестное действие. Используйте create, update или delete.' });

    } catch (error) {
        console.error(error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: `Артикул '${productData.mainArticul}' уже занят.`, details: error.errors.map(e => e.message) });
        }
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: 'Ошибка валидации', details: error.errors.map(e => e.message) });
        }
        res.status(500).json({ message: 'Ошибка сервера', details: error.message });
    }
};
