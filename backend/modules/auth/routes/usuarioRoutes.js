const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const auth = require('../../../shared/middlewares/auth');
const authorize = require('../../../shared/middlewares/authorize');

router.get('/', auth, authorize('gestor'), usuarioController.listar);
router.get('/:id', auth, usuarioController.buscarPorId);
router.post('/', auth, authorize('admin'), usuarioController.criar);
router.put('/:id', auth, usuarioController.atualizar);
router.delete('/:id', auth, authorize('admin'), usuarioController.deletar);

module.exports = router;
