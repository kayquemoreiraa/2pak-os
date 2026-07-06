const express = require('express');
const router  = express.Router();

router.use('/auth',     require('./routes/authRoutes'));
router.use('/usuarios', require('./routes/usuarioRoutes'));

module.exports = router;
