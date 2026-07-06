const express = require('express');
const router  = express.Router();

// Redireciona para as rotas oficiais sem mocks
router.use('/', require('./routes/webhookRoutes'));

module.exports = router;
