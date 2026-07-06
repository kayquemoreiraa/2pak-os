const express = require('express');
const router  = express.Router();
router.use('/', require('./routes/automacaoRoutes'));
module.exports = router;
