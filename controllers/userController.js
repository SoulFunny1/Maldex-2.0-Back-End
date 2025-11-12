// controllers/userController.js
import UserModel from "../models/User.js";
import sequelize from "../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const User = UserModel(sequelize);
const JWT_SECRET = process.env.JWT_SECRET || "your_default_jwt_secret";

// 1. Регистрация пользователя
export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email и пароль обязательны." });
    }

    // При регистрации по умолчанию роль — user
    const newUser = await User.create({ email, password, role: "user" });

    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      message: "Пользователь успешно зарегистрирован.",
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Пользователь с таким email уже существует." });
    }
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ message: "Неверный формат email." });
    }
    console.error("Ошибка при регистрации пользователя:", error);
    res.status(500).json({ message: "Ошибка сервера при регистрации.", error: error.message });
  }
};

// 2. Авторизация (вход)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.validPassword(password))) {
      return res.status(401).json({ message: "Неверный email или пароль." });
    }

    // ⚙ Проверка роли
    if (user.role !== "user" && user.role !== "admin") {
      return res.status(403).json({ message: "Неверная роль пользователя." });
    }

    // Создание JWT токена
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Отправляем токен в cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 день
    });

    res.status(200).json({
      id: user.id,
      email: user.email,
      role: user.role,
      message: "Вход успешен.",
    });
  } catch (error) {
    console.error("Ошибка при входе пользователя:", error);
    res.status(500).json({ message: "Ошибка сервера при входе.", error: error.message });
  }
};

// 3. Выход
export const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Выход успешен." });
};

// 4. Получить текущего пользователя
export const getCurrentUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Не авторизован." });
  }

  return res.status(200).json({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
    message: "Данные профиля успешно получены.",
  });
};

// =====================================
// === АДМИНИСТРАТИВНЫЕ ФУНКЦИИ ========
// =====================================

// Получить всех пользователей
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Ошибка при получении пользователей:", error);
    res.status(500).json({ message: "Ошибка сервера." });
  }
};

// Обновить пользователя (роль / пароль)
export const manageUser = async (req, res) => {
  const { id, role, password } = req.body;

  if (!id) {
    return res.status(400).json({ message: "ID пользователя обязателен." });
  }

  try {
    const updateData = {};

    // Обновление роли
    if (role && ["user", "admin"].includes(role)) {
      updateData.role = role;
    }

    // Обновление пароля
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Нет данных для обновления." });
    }

    const [updatedRows] = await User.update(updateData, { where: { id } });

    if (updatedRows === 1) {
      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ["password"] },
      });
      return res.status(200).json({ message: "Пользователь обновлён.", user: updatedUser });
    } else {
      return res.status(404).json({ message: "Пользователь не найден." });
    }
  } catch (error) {
    console.error("Ошибка при обновлении пользователя:", error);
    res.status(500).json({ message: "Ошибка сервера.", error: error.message });
  }
};

// Удалить пользователя
export const deleteUser = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "ID обязателен." });
  }

  try {
    const result = await User.destroy({ where: { id } });
    if (result === 1) {
      return res.status(200).json({ message: "Пользователь удалён." });
    } else {
      return res.status(404).json({ message: "Пользователь не найден." });
    }
  } catch (error) {
    console.error("Ошибка при удалении пользователя:", error);
    res.status(500).json({ message: "Ошибка сервера.", error: error.message });
  }
};
