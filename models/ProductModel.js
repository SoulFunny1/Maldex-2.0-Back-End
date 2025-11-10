import { DataTypes } from "sequelize";

// Модель для хранения информации о товарах.
// Использует функциональный экспорт, который принимает экземпляр Sequelize.
export default (sequelize) => {
    const Product = sequelize.define(
        "Product",
        {
            // ... (определение полей) ...
            articul: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true, 
                comment: 'Уникальный артикул товара (SKU)'
            },
            
            price: {
                type: DataTypes.DECIMAL(10, 2), 
                allowNull: false,
                comment: 'Цена товара'
            },
            
            img: {
                type: DataTypes.JSON, 
                allowNull: true, 
                defaultValue: [],
                comment: 'Массив URL изображений'
            },
            
            color: {
                type: DataTypes.STRING(50),
                allowNull: true,
                comment: 'Цвет товара'
            },
            
            description: {
                type: DataTypes.TEXT,
                allowNull: false,
                comment: 'Подробное описание товара'
            },
        },
        {
            tableName: "products",
            timestamps: true,
        }
    );

    return Product;
};