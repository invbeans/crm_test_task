const axios = require('axios');

// Переменные для хранения access, refresh токенов
let accessToken = '';
let refreshToken = '';

// Объект с заголовками запросов после авторизации
let config = {
    headers: {
        "Authorization": "",
        "Content-Type": "application/json"
    }
}

// Объект с полями для получения access, refresh токенов
const getTokensBody = {
    "client_id": process.env.INTEGRATION_ID,
    "client_secret": process.env.SECRET_KEY,
    "grant_type": "authorization_code",
    "code": process.env.AUTHORIZATION_CODE,
    "redirect_uri": "https://bcbc-85-26-164-131.ngrok-free.app"
}

class apiController {
    // Метод для получения токенов, принимает информацию об аккаунте и настройки заголовков,
    // возвращает пару токенов
    getTokens = async (req, res) => {
        // Отправка данных об аккаунте с помощью метода POST
        axios.post('https://vlada3234vasileva.amocrm.ru/oauth2/access_token', getTokensBody, config)
            .then(response => {
                const data = response.data;
                // Сохранение токенов в переменных
                accessToken = data.access_token;
                refreshToken = data.refresh_token;
                // Обновление заголовков
                config.headers.Authorization = `Bearer ${accessToken}`;
                res.json(data);
            })
            .catch(error => res.status(400).json(error.message || "Не удалось получить токены"));
    }

    // Метод для поиска контактов и сохранения сделки
    getContactPostLead = async (req, res, next) => {
        // Сохранение заголовков запроса в реквесте запроса
        req.config = config;
        next();
    }
}

module.exports = new apiController();