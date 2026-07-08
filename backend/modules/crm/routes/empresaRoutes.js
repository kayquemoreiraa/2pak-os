const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresaController');
const authMiddleware = require('../../../shared/middlewares/auth');

router.get('/', authMiddleware, empresaController.listar);
router.post('/', authMiddleware, empresaController.criar);
router.get('/:id', authMiddleware, empresaController.buscarPorId);
router.put('/:id', authMiddleware, empresaController.atualizar);
router.delete('/:id', authMiddleware, empresaController.deletar);

// Nova rota de importação via Maps
router.post('/importar-maps', authMiddleware, empresaController.importarDoMaps);

module.exports = router;
