const express = require('express');
const router = express.Router();
const contatoController = require('../controllers/contatoController');

router.get('/', contatoController.listar);
router.get('/:id', contatoController.buscarPorId);
router.post('/', contatoController.criar);
router.put('/:id', contatoController.atualizar);
router.delete('/:id', contatoController.deletar);

module.exports = router;