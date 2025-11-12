import { DataTypes } from "sequelize";

/**
 * Функция, которая определяет модель Sequelize.
 */
export default (sequelize) => {
    const Product = sequelize.define(
        "Product",
        {
            mainArticul: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true, 
                comment: 'Уникальный артикул основного товара (SKU)'
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false, 
                comment: 'Название товара'
            },
            category: { 
                type: DataTypes.STRING(100),
                allowNull: true,
                comment: 'Категория товара'
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true, 
                comment: 'Основное описание товара'
            },
            price: {
                type: DataTypes.DECIMAL(10,2), // Используем DECIMAL для точной цены
                allowNull: false,
                defaultValue: 0.00,
                comment: 'Основная цена товара'
            },
            stock: { 
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: 'Количество на складе'
            },
            weight: {
                type: DataTypes.DECIMAL(10, 3),
                allowNull: true
            },
            packageVolume: { type: DataTypes.DECIMAL(10, 3), allowNull: true },
            transportPackageType: { type: DataTypes.STRING(100), allowNull: true },
            quantityInPackage: { type: DataTypes.INTEGER, allowNull: true },
            individualPackageType: { type: DataTypes.STRING(100), allowNull: true },
            brandingTypes: { type: DataTypes.JSON, allowNull: true },
            
            productData: { 
                type: DataTypes.JSON, 
                allowNull: true,
                defaultValue: {},
                comment: 'JSON-объект с дополнительными характеристиками'
            },
        },
        {
            tableName: "products",
            timestamps: true, // createdAt, updatedAt
        }
    );
    return Product;
};