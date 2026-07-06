const express = require('express');
const router = express.Router();
const pipelineController = require('../controllers/pipelineController');

router.get('/', pipelineController.listar);
router.patch('/mover', pipelineController.mover);

module.exports = router;