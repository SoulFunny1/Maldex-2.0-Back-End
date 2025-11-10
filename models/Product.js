// models/Product.js
import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Product = sequelize.define(
        "Product",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true, // Имя продукта обычно должно быть уникальным
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            img: {
                type: DataTypes.STRING(255),
                allowNull: true, // URL изображения
            },
            price: {
                type: DataTypes.DECIMAL(10, 2), // Цена с 10 цифрами, 2 после запятой
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM('active', 'archived', 'draft'), // Статус продукта (например, активен, в архиве)
                allowNull: false,
                defaultValue: 'active',
            },
            // Здесь можно добавить внешний ключ categoryId, если продукты связаны с категориями
            // categoryId: {
            //     type: DataTypes.INTEGER,
            //     references: {
            //         model: 'categories', // Имя таблицы категории (или FastCategory)
            //         key: 'id',
            //     }
            // }
        },
        {
            tableName: "products",
            timestamps: true,
        }
    );

    // Здесь можно настроить связь, если она нужна
    // Product.associate = (models) => {
    //     Product.belongsTo(models.Category, { foreignKey: 'categoryId' });
    // };

    return Product;
};