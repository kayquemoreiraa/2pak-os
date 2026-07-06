const express              = require('express');
const router               = express.Router();
const automacaoController  = require('../controllers/automacaoController');
const auth                 = require('../../../shared/middlewares/auth');

router.use(auth);

router.get('/automacoes/eventos', automacaoController.listarEventos);
router.get('/automacoes/logs',    automacaoController.listarLogs);
router.get('/automacoes',         automacaoController.listar);
router.get('/automacoes/:id',     automacaoController.buscarPorId);
router.post('/automacoes',        automacaoController.criar);
router.put('/automacoes/:id',     automacaoController.atualizar);
router.delete('/automacoes/:id',  automacaoController.remover);

module.exports = router;
