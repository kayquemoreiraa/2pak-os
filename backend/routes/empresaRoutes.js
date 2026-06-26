const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');

router.get('/', empresaController.listar);
router.get('/:id', empresaController.buscarPorId);
router.post('/', empresaController.criar);
router.put('/:id', empresaController.atualizar);
router.delete('/:id', empresaController.deletar);

module.exports = router;