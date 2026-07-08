const express = require('express');
const router = express.Router();
const scraperController = require('./scraper.controller');
const authMiddleware = require('../../shared/middlewares/auth');

router.post('/maps', authMiddleware, scraperController.buscarNoMaps);

module.exports = router;
