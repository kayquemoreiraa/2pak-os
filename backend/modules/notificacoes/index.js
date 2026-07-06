const express = require('express');
const router  = express.Router();

router.use('/notificacoes', require('./routes/notificacaoRoutes'));

module.exports = router;
