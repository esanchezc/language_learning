const express = require('express');
const router = express.Router();
const languagesController = require('../controllers/languagesController');

router.get('/', languagesController.getAllLanguages);
router.get('/:id', languagesController.getLanguageById);

module.exports = router;