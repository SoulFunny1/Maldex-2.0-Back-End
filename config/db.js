// config/db.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,      // имя базы
    process.env.DB_USER,      // пользователь
    process.env.DB_PASSWORD,  // пароль
    {
        host: process.env.DB_HOST || "localhost",
        dialect: "mysql",
        logging: false, // можно включить true для логов SQL
    }
);

export default sequelize;
