import sequelize from '../config/db.js';
import ProductModel from '../models/ProductModel.js';
import { Op } from 'sequelize';

// Внимание: ProductModel(sequelize) предполагает, что модель правильно инициализирована
const Product = ProductModel(sequelize); 

/**
 * Вспомогательная функция для форматирования и очистки данных продукта перед сохранением.
 *
 * Ключевое изменение: Теперь она создает чистый объект productData, 
 * игнорируя любые старые (и потенциально поврежденные) поля из body.productData.
 * * @param {Object} body - Тело запроса, содержащее данные продукта.
 * @returns {Object} Отформатированные данные для Sequelize, готовые к слиянию.
 */
const getProductData = (body) => {
    // 1. Подготовка основных полей
    const data = {
        mainArticul: body.mainArticul,  
        name: body.name,
        category: body.category,
        description: body.description,
        // Преобразование числовых полей
        price: body.price != null && !isNaN(Number(body.price)) ? Number(body.price) : undefined,
        stock: body.stock != null && !isNaN(Number(body.stock)) ? Number(body.stock) : undefined,
        weight: body.weight != null && !isNaN(Number(body.weight)) ? Number(body.weight) : undefined,
        packageVolume: body.packageVolume != null && !isNaN(Number(body.packageVolume)) ? Number(body.packageVolume) : undefined,
        quantityInPackage: body.quantityInPackage != null && !isNaN(Number(body.quantityInPackage)) ? Number(body.quantityInPackage) : undefined,
        transportPackageType: body.transportPackageType,
        individualPackageType: body.individualPackageType,
    };

    // 2. Обработка Array полей (для brandingTypes)
    data.brandingTypes = Array.isArray(body.brandingTypes) ? body.brandingTypes : 
                               (body.brandingTypes ? (typeof body.brandingTypes === 'string' ? [body.brandingTypes] : [body.brandingTypes]) : undefined);

    // 3. Создание чистого объекта productData только из явных полей
    const finalProductData = {};
    
    // Включаем материал, так как он есть в ваших данных
    if (body.material !== undefined) {
        finalProductData.material = body.material;
    }
    
    // Включаем цвет
    if (body.color !== undefined) {
        finalProductData.color = body.color;
    }
    
    // Гарантируем, что img - это массив
    if (body.img !== undefined) {
        finalProductData.img = Array.isArray(body.img) ? body.img : (body.img ? [body.img] : []);
    }

    // Если в запросе вообще нет данных для productData, мы не добавляем это поле в 'data'
    if (Object.keys(finalProductData).length > 0) {
        data.productData = finalProductData;
    }
    
    // 4. Удаляем все поля, которые не были предоставлены (undefined), из основного объекта 'data'
    Object.keys(data).forEach(key => {
        if (data[key] === undefined || (typeof data[key] === 'number' && isNaN(data[key]))) {
            delete data[key];
        }
    });

    return data;
};

// === READ: Получить все товары ===
export const getProducts = async (req, res) => {
    try {
        const products = await Product.findAll({ order: [['updatedAt', 'DESC']] });
        res.status(200).json(products);
    } catch (error) {
        console.error("Ошибка при получении всех товаров:", error);
        res.status(500).json({ message: 'Ошибка сервера при получении товаров', details: error.message });
    }
};

// === READ: Получить товар по ID ===
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ message: 'Товар не найден' });
        res.status(200).json(product);
    } catch (error) {
        console.error("Ошибка при получении товара по ID:", error);
        res.status(500).json({ message: 'Ошибка сервера при получении товара', details: error.message });
    }
};

// === CREATE: Создать новый товар ===
export const createProduct = async (req, res) => {
    const productData = getProductData(req.body);

    try {
        if (!productData.mainArticul || !productData.name) {
            return res.status(400).json({ message: 'Требуется артикул и название.' });
        }
        
        const product = await Product.create(productData);
        return res.status(201).json({ message: 'Товар успешно создан', product });

    } catch (error) {
        console.error("Ошибка при создании товара:", error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            const articul = productData.mainArticul || 'неизвестный';
            return res.status(400).json({ message: `Артикул '${articul}' уже занят.`, details: error.errors.map(e => e.message) });
        }
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ message: 'Ошибка валидации данных', details: error.errors.map(e => e.message) });
        }
        res.status(500).json({ message: 'Ошибка сервера при создании товара', details: error.message });
    }
};

// === UPDATE: Обновить существующий товар ===
export const updateProduct = async (req, res) => {
    const id = req.params.id; 
    // partialData содержит только те поля, которые были явно предоставлены в запросе
    const partialData = getProductData(req.body);

    delete partialData.id; 

    try {
        if (!id) return res.status(400).json({ message: 'Требуется ID товара для обновления.' });

        // 1. Находим существующий товар
        let existingProduct = await Product.findByPk(id);
        if (!existingProduct) return res.status(404).json({ message: 'Товар с указанным ID не найден для обновления.' });

        // 2. Логика слияния для JSON-поля productData:
        if (partialData.productData) {
            // Берем существующий productData (если есть)
            const existingProductData = existingProduct.productData || {};
            
            // Сливаем: старые данные + чистые новые данные из запроса.
            // Это решает проблему, когда поля productData теряются или перезаписываются.
            const mergedProductData = {
                ...existingProductData, 
                ...partialData.productData,
            };
            
            // Заменяем поле productData в partialData на полностью объединенный объект
            partialData.productData = mergedProductData;
        }

        // 3. Обновляем товар
        const [updatedRows] = await Product.update(partialData, { 
            where: { id }, 
            individualHooks: true 
        });
        
        if (updatedRows === 0) {
            return res.status(200).json({ message: 'Товар существует, но данные не изменились.', product: existingProduct });
        }
        
        // Получаем обновленный товар для отправки клиенту
        const finalUpdatedProduct = await Product.findByPk(id);
        return res.status(200).json({ message: 'Товар успешно обновлен', product: finalUpdatedProduct });

    } catch (error) {
        console.error(`Ошибка при обновлении товара (ID: ${id}):`, error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            const articul = partialData.mainArticul || 'неизвестный';
            return res.status(400).json({ message: `Артикул '${articul}' уже занят.`, details: error.errors.map(e => e.message) });
        }
        if (error.name === 'SequelizeValidationError') {
             return res.status(400).json({ message: 'Ошибка валидации данных', details: error.errors.map(e => e.message) });
        }
        res.status(500).json({ message: 'Ошибка сервера при обновлении товара', details: error.message });
    }
};

// === DELETE: Удалить товар ===
export const deleteProduct = async (req, res) => {
    const id = req.params.id;

    try {
        if (!id) return res.status(400).json({ message: 'Требуется ID товара для удаления.' });

        const deletedRows = await Product.destroy({ where: { id } });
        
        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Товар не найден для удаления.' });
        }
        
        return res.status(200).json({ message: 'Товар успешно удален', deletedId: id });

    } catch (error) {
        console.error(`Ошибка при удалении товара (ID: ${id}):`, error);
        res.status(500).json({ message: 'Ошибка сервера при удалении товара', details: error.message });
    }
};