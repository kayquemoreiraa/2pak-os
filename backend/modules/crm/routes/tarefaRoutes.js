const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tarefaController');

router.get('/geral', ctrl.findAll);
router.get('/', ctrl.findAll);
router.post('/', ctrl.create);
router.put('/:id', ctrl.atualizar);
router.delete('/:id', ctrl.remove);

module.exports = router;
