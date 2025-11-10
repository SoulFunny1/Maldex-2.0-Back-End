import UserModel from "../models/User.js";
import sequelize from "../config/db.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; // Добавим bcrypt для хеширования пароля при админ. обновлении

// Инициализация модели
const User = UserModel(sequelize);

// Установите ваш секретный ключ JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret'; 

// 1. Регистрация нового пользователя (публичный)
export const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email и пароль обязательны." });
        }

        // Пароль хешируется автоматически через хук User.beforeCreate в модели
        const newUser = await User.create({ email, password });
        
        // Отправляем только безопасные данные
        res.status(201).json({ 
            id: newUser.id, 
            email: newUser.email, 
            status: newUser.status,
            message: "Пользователь успешно зарегистрирован." 
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

// 2. Аутентификация пользователя (Вход)
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        // Проверка пользователя и пароля
        if (!user || !(await user.validPassword(password))) {
            return res.status(401).json({ message: "Неверный email или пароль." });
        }
        
        // Если пользователь неактивен (например, забанен)
        if (user.status !== 'active') {
             return res.status(403).json({ message: "Ваш аккаунт неактивен." });
        }

        // Создание JWT токена
        const token = jwt.sign(
            { id: user.id, email: user.email, status: user.status }, 
            JWT_SECRET, 
            { expiresIn: '1d' }
        );

        // Отправка токена в куки (более безопасно, чем в теле ответа)
        res.cookie('token', token, { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', // Только HTTPS в продакшене
            maxAge: 24 * 60 * 60 * 1000 // 1 день
        });

        // Отправляем ответ без хешированного пароля
        res.status(200).json({ 
            id: user.id, 
            email: user.email, 
            status: user.status,
            message: "Вход успешен."
        });

    } catch (error) {
        console.error("Ошибка при входе пользователя:", error);
        res.status(500).json({ message: "Ошибка сервера при входе.", error: error.message });
    }
};

// 3. Выход (удаление куки)
export const logoutUser = (req, res) => {
    res.clearCookie('token'); // Удаляем токен из куки
    res.status(200).json({ message: "Выход успешен." });
};

// 4. Получение профиля (Требуется Middleware для проверки токена)
export const getCurrentUser = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Не авторизован. Пожалуйста, войдите в систему." });
    }
    
    return res.status(200).json({
        id: req.user.id,
        email: req.user.email,
        status: req.user.status,
        message: "Данные профиля успешно получены."
    });
};

// ===============================================
// === АДМИНИСТРАТИВНЫЕ КОНТРОЛЛЕРЫ ДЛЯ CRUD ===
// ===============================================

// @desc    Получить список всех пользователей (Админ)
// @route   GET /api/admin/users
export const getAllUsers = async (req, res) => {
    try {
        // Исключаем поле 'password' из результата
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(users);
    } catch (error) {
        console.error('Ошибка при получении списка пользователей:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении пользователей.' });
    }
};

// @desc    Управление пользователем: Обновление статуса/пароля (Админ)
// @route   POST /api/admin/users/manage
export const manageUser = async (req, res) => {
    const { id, status, password } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'ID пользователя обязателен для управления.' });
    }

    try {
        const updateData = {};
        
        // 1. Обновление статуса
        if (status && ['active', 'inactive', 'banned'].includes(status)) {
            updateData.status = status;
        }

        // 2. Обновление пароля (если предоставлен)
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'Не предоставлено данных для обновления (статус или пароль).' });
        }

        const [updatedRows] = await User.update(updateData, {
            where: { id },
        });

        if (updatedRows === 1) {
            // Получаем обновленного пользователя (исключая пароль)
            const updatedUser = await User.findByPk(id, { attributes: { exclude: ['password'] } });
            return res.status(200).json({ message: 'Пользователь успешно обновлен.', user: updatedUser });
        } else {
            return res.status(404).json({ message: 'Пользователь не найден.' });
        }

    } catch (error) {
        console.error('Ошибка при управлении пользователем:', error);
        res.status(500).json({ message: 'Ошибка сервера при обновлении пользователя.', error: error.message });
    }
};

// @desc    Удалить пользователя (Админ)
// @route   POST /api/admin/users/delete
export const deleteUser = async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'ID пользователя обязателен для удаления.' });
    }

    try {
        const result = await User.destroy({
            where: { id }
        });

        if (result === 1) {
            return res.status(200).json({ message: 'Пользователь успешно удален.' });
        } else {
            return res.status(404).json({ message: 'Пользователь для удаления не найден.' });
        }
    } catch (error) {
        console.error('Ошибка при удалении пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера при удалении пользователя.', error: error.message });
    }
};