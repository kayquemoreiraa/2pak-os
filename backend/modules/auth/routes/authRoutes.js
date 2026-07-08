const express        = require('express');
const router         = express.Router();
const authController = require('../controllers/authController');
const usuarioController = require('../controllers/usuarioController');
const auth           = require('../../../shared/middlewares/auth');

router.post('/login', authController.login);
router.post('/registrar', usuarioController.criar); // Rota de cadastro pública via Supabase
router.get('/me',     auth, authController.me);
router.put('/senha',  auth, authController.alterarSenha);

module.exports = router;
