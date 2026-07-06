const express = require('express');
const router  = express.Router();

router.use('/empresas',          require('./routes/empresaRoutes'));
router.use('/contatos',          require('./routes/contatoRoutes'));
router.use('/tarefas',           require('./routes/tarefaRoutes'));
router.use('/observacoes',       require('./routes/observacaoRoutes'));
router.use('/status-prospeccao', require('./routes/statusProspeccaoRoutes'));
router.use('/dashboard',         require('./routes/dashboardRoutes'));
router.use('/pipeline',          require('./routes/pipelineRoutes'));
router.use('/followup',          require('./routes/followupRoutes'));

module.exports = router;
