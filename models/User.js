// models/User.js
import { DataTypes } from "sequelize";
import bcrypt from 'bcrypt';

export default (sequelize) => {
    const User = sequelize.define(
        "User",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true, // Email должен быть уникальным
                validate: {
                    isEmail: true, // Встроенная проверка Sequelize на email
                },
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM('active', 'inactive', 'banned'),
                allowNull: false,
                defaultValue: 'active',
            },
        },
        {
            tableName: "users",
            timestamps: true,
        }
    );

    // Хук Sequelize, который срабатывает ПЕРЕД сохранением пользователя
    User.beforeCreate(async (user) => {
        // Хешируем пароль перед его сохранением в базу данных
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    });

    // Метод экземпляра для сравнения паролей
    User.prototype.validPassword = function(password) {
        return bcrypt.compare(password, this.password);
    };

    return User;
};