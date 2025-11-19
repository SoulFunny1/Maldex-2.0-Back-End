import express from "express";
import cors from "cors";
import sequelize from "./config/db.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import categoryRoutes from "./routes/categoryRoutes.js";
import fastCategoryRoutes from "./routes/fastCategoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminProductRoutes from "./routes/allProductRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/fastCategories", fastCategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/products", adminProductRoutes); // <--- НОВЫЙ АДМИН-МАРШРУТ
app.use("/api/cart", cartRoutes);

app.get("/", (req, res) => {
    res.send("API работает!");
});

// DB connect + start server
sequelize
    .authenticate()
    .then(() => {
        console.log("Подключение к базе данных установлено успешно.");
        app.listen(PORT, () =>
            console.log(`Сервер запущен: http://localhost:${PORT}`)
        );
    })
    .catch((err) => console.error("Ошибка подключения к БД:", err));
