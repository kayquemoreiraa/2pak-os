const express = require('express');
const router = express.Router();
const followupController = require('../controllers/followupController');

router.get('/', followupController.listar);

module.exports = router;