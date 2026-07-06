const express = require('express');
const router = express.Router();
const tarefaController = require('../controllers/tarefaController');

router.get('/geral', tarefaController.listarGeral);
router.get('/', tarefaController.listar);
router.get('/:id', tarefaController.buscarPorId);
router.post('/', tarefaController.criar);
router.put('/:id', tarefaController.atualizar);
router.delete('/:id', tarefaController.deletar);

module.exports = router;
