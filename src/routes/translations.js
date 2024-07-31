const express = require('express');
const router = express.Router();
const translationsController = require('../controllers/translationsController');

router.get('/:id', translationsController.getTranslationById);

module.exports = router;