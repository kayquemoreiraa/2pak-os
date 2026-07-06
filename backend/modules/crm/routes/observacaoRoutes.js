const express = require('express');
const router = express.Router();
const observacaoController = require('../controllers/observacaoController');

router.get('/', observacaoController.listar);
router.get('/:id', observacaoController.buscarPorId);
router.post('/', observacaoController.criar);
router.put('/:id', observacaoController.atualizar);
router.delete('/:id', observacaoController.deletar);

module.exports = router;