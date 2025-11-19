// /models/cartItem.js

import { DataTypes } from "sequelize";

export default (sequelize) => {
    const CartItem = sequelize.define(
        "CartItem",
        {
            // ID товара (FK) будет определен в /models/index.js через ассоциацию
            // ID пользователя (FK) будет определен в /models/index.js через ассоциацию
            
            // 💡 Ключевые поля для одежды:
            size: {
                type: DataTypes.STRING(20),
                allowNull: false,
                comment: 'Выбранный размер (S, M, L, XL и т.д.)'
            },
            color: {
                type: DataTypes.STRING(50),
                allowNull: false,
                comment: 'Выбранный цвет (например, "Красный", "Синий")'
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
                validate: {
                    min: 1,
                },
                comment: 'Количество единиц товара'
            },
            priceAtTimeOfOrder: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                comment: 'Цена товара на момент добавления в корзину (для защиты от изменения цены)'
            }
        },
        {
            tableName: "cart_items",
            timestamps: true,
        }
    );

    // Добавляем уникальный индекс для предотвращения дублирования вариантов
    // (пользователь, товар, размер, цвет)
    CartItem.removeAttribute('id'); // Убираем авто-ID, используем композитный ключ
    CartItem.beforeSync(() => {
        sequelize.query(`
            ALTER TABLE cart_items 
            ADD CONSTRAINT cart_item_unique_combination 
            UNIQUE (UserId, ProductId, size, color);
        `);
    });

    return CartItem;
};