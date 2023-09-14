const Router = require('express');
const router = new Router();
const controller = require('../controllers/api.controller');
const getContactMiddleware = require('../middlewares/getContact.middleware')
const postLeadMiddleware = require('../middlewares/postLead.middleware')

router.get('/getTokens', controller.getTokens);
router.post('/getContactPostLead', controller.getContactPostLead, getContactMiddleware, postLeadMiddleware);

module.exports = router;
