const express = require('express');
const router = express.Router();
const wordsController = require('../controllers/wordsController');

router.get('/', wordsController.getAllWords);
router.get('/:id(\\d+)', wordsController.getWordById);
router.get('/:languageCode', wordsController.getWordsByLanguage);
router.get('/:wordId/translations', wordsController.getWordTranslations);
router.get('/:wordId/translations/:languageCode', wordsController.getWordTranslationByLanguage);
router.post('/', wordsController.createOrUpdateWord);

module.exports = router;