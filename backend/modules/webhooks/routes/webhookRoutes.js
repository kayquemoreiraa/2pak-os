const express           = require('express');
const router            = express.Router();
const WebhookController = require('../controllers/webhookController');
const auth              = require('../../../shared/middlewares/auth');

router.use(auth);

router.get('/webhooks/logs', WebhookController.listarLogs);
router.post('/webhooks',     WebhookController.criar);
router.get('/webhooks',      WebhookController.listar);
router.delete('/webhooks/:id', WebhookController.deletar);

module.exports = router;
