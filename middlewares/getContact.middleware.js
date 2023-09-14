const axios = require('axios');

// Метод для создания нового пользователя.
// Принимает новую информацию о пользователе: имя, почту, телефон и 
// идентификаторы кастомных полей: почты и телефона
createUserObject = (name, email, emailFieldId, phone, phoneFieldId) => {
    return {
        "name": name,
        "custom_fields_values": [
            {
                "field_id": emailFieldId,
                "values": [{
                    "value": email
                }]
            },
            {
                "field_id": phoneFieldId,
                "values": [{
                    "value": phone
                }]
            }
        ]
    }
}

// Метод для создания модели кастомных объектов.
// Описывает названия и тип данных полей почта и телефон
createCustomFieldsObject = () => {
    return [
        {
            "name": "email",
            "type": "string"
        },
        {
            "name": "phone",
            "type": "string"
        }
    ]
}

// Миддлвейр для поиска и редактирования/сохранения контакта
module.exports = async function (req, res, next){
    // Заголовки запроса
    let config = req.config;
    // Переменные идентификатор пользователя,
    // пользователь, найденный по телефону и 
    // пользователь, найденный по почте
    let id = 0;
    let responsePhone = ''
    let responseEmail = ''

    try {
        // Получение параметров пользователя
        const { name, email, phone } = req.body;
        // Поиск пользователя по телефону и почте
        responsePhone = await axios.get(`https://vlada3234vasileva.amocrm.ru/api/v4/contacts?query=${phone}`, config);
        responseEmail = await axios.get(`https://vlada3234vasileva.amocrm.ru/api/v4/contacts?query=${email}`, config);

        // Если оба объекта пустые - значит такой пользователь не найден
        if (responsePhone === '' && responseEmail === '') {
            // Создание объекта с новыми кастомными полями
            const customFieldsModel = this.createCustomFieldsObject();
            // Отправка запроса для добавления полей сущности контакта
            const fieldsRes = await axios.post('https://vlada3234vasileva.amocrm.ru/api/v4/contacts/custom_fields', customFieldsModel, config);

            // Получение кастомных полей из результата запроса
            const customFields = fieldsRes.data._embedded.custom_fields;
            // Поиск идентификаторов для полей почты и телефона по названиям полей
            const emailFieldId = customFields.filter(elem => elem.name === "email").id;
            const phoneFieldId = customFields.filter(elem => elem.name === "phone").id;

            // Создание нового объекта контакта с именем и кастомными полями
            const newContact = [this.createUserObject(name, email, emailFieldId, phone, phoneFieldId)];
            // Сохранение контакта с помощью метода POST
            const userRes = await axios.post('https://vlada3234vasileva.amocrm.ru/api/v4/contacts', newContact, config);
            // Получение идентификатора нового пользователя
            id = userRes.data._embedded.contacts[0].id;
        }
        // Иначе, если контакт был найден 
        else { 
            // Выбирается список контактов, отфильтрованных либо по телефону, либо по почте
            const foundContacts = responsePhone.data || responseEmail.data;
            // Выбирается первый контакт из списка
            const firstContact = foundContacts._embedded.contacts[0];
            // Его идентификатор сохраняется в переменной
            id = firstContact.id;

            // Получение кастомных полей из найденного контакта
            const customFields = firstContact.custom_fields_values;
            // Поиск идентификаторов для полей почты и телефона по названиям полей
            const emailFieldId = customFields.filter(elem => elem.field_name === "email").id;
            const phoneFieldId = customFields.filter(elem => elem.field_name === "phone").id;

            // Создание нового обновленного контакта с именем и кастомными полями
            let patchContact = this.createUserObject(name, email, emailFieldId, phone, phoneFieldId)
            // Добавление идентификатора пользователя для пакетного редактирования
            patchContact["id"] = id
            patchContact = [patchContact];
            // Обновление контакта с помощью метода PATCH
            axios.patch(`https://vlada3234vasileva.amocrm.ru/api/v4/contacts`, patchContact, config)
            .then(() => {});
        }
        // Сохранение идентификатора пользователя в реквесте запроса
        req.userId = id;
        next();
    } catch (error) {
        res.status(400).json(error.message);
    }
}