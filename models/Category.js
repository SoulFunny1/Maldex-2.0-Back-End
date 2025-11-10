// models/Category.js
import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Category = sequelize.define(
        "Category",
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
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            img: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
        },
        {
            tableName: "categories",
            timestamps: true,
        }
    );

    return Category;
};
