const express                 = require('express');
const router                  = express.Router();
const notificacaoController   = require('../controllers/notificacaoController');
const auth                    = require('../../../shared/middlewares/auth');

router.get('/',              auth, notificacaoController.listar);
router.patch('/:id/lida',    auth, notificacaoController.marcarLida);
router.patch('/todas/lidas', auth, notificacaoController.marcarTodasLidas);

module.exports = router;
