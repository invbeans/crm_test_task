const axios = require('axios');

// Миддлвейр для сохранения сделки на сервере
module.exports = async function (req, res) {
    // Идентификатор пользователя
    const id = req.userId;
    // Заголовки запроса
    const config = req.config;
    // Новый объект сделки
    const newLead = [{
        "name": "Сделка для примера",
        "price": 1000,
        "responsible_user_id": id
    }]
    // Сохранение сделки с помощью метода POST
    axios.post("https://vlada3234vasileva.amocrm.ru/api/v4/leads", newLead, config)
        .then(response => {
            res.json(response.data);
        })
        .catch(error => res.status(400).json(error.message))
}