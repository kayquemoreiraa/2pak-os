const express        = require('express');
const router         = express.Router();
const authController = require('../controllers/authController');
const auth           = require('../../../shared/middlewares/auth');

router.post('/login', authController.login);
router.get('/me',     auth, authController.me);
router.put('/senha',  auth, authController.alterarSenha);

module.exports = router;
