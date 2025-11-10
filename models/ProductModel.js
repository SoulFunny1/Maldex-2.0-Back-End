import { DataTypes } from "sequelize";

// Модель для хранения информации о товарах.
// Использует функциональный экспорт, который принимает экземпляр Sequelize.
export default (sequelize) => {
    const Product = sequelize.define(
        "Product",
        {
            // id: Автоматически создается Sequelize как Primary Key (INTEGER, autoIncrement)
            
            articul: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true, // Артикул должен быть уникальным
                comment: 'Уникальный артикул товара (SKU)'
            },
            
            price: {
                // Используем DECIMAL для точного хранения денег
                type: DataTypes.DECIMAL(10, 2), 
                allowNull: false,
                comment: 'Цена товара'
            },
            
            // Массив URL-адресов изображений (хранится как JSON-строка в базе)
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