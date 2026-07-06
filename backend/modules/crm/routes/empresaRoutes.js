const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');
const auth = require('../../../shared/middlewares/auth');

// Protege todas as rotas do m?dulo de empresas com o middleware de autentica??o
router.use(auth);

router.get('/', empresaController.listar);
router.get('/:id', empresaController.buscarPorId);
router.post('/', empresaController.criar);
router.put('/:id', empresaController.atualizar);
router.delete('/:id', empresaController.deletar);

module.exports = router;
