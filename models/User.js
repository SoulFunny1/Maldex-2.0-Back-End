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
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            role: {
                type: DataTypes.ENUM('user', 'admin'),
                allowNull: false,
                defaultValue: 'user', // по умолчанию обычный пользователь
            },
        },
        {
            tableName: "users",
            timestamps: true,
        }
    );

    // Хешируем пароль перед сохранением
    User.beforeCreate(async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    });

    // Проверка пароля
    User.prototype.validPassword = function(password) {
        return bcrypt.compare(password, this.password);
    };

    return User;
};
