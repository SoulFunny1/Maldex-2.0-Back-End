// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret';

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.token; // достаём токен из cookie

    if (!token) {
      return res.status(401).json({ message: 'Нет токена, доступ запрещён.' });
    }

    // Проверяем и декодируем токен
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // добавляем пользователя в req

    next(); // продолжаем выполнение
  } catch (error) {
    console.error('Ошибка аутентификации:', error.message);
    return res.status(401).json({ message: 'Недействительный или просроченный токен.' });
  }
};
