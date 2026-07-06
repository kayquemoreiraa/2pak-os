const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusProspeccaoController');

router.get('/', statusController.listar);
router.get('/:id', statusController.buscarPorId);
router.post('/', statusController.criar);
router.put('/:id', statusController.atualizar);
router.delete('/:id', statusController.deletar);

module.exports = router;