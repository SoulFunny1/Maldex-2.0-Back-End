// models/FastCategory.js
import { DataTypes } from "sequelize";

export default (sequelize) => {
    const FastCategory = sequelize.define(
        "FastCategory",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
            },
            icon: { // Используем 'icon' вместо 'img' и 'description'
                type: DataTypes.STRING(255),
                allowNull: true,
            },
        },
        {
            tableName: "fast_categories", // Изменено на fast_categories
            timestamps: true,
        }
    );

    return FastCategory;
};