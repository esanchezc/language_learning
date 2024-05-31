const express = require('express');
const { Pool } = require('pg');

const app = express();

const db = new Pool({
  user: process.env.POSTGRES_USER,
  host: 'db',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

app.use(express.json());

/**
 * @swagger
 * /languages:
 *   get:
 *     description: Get all languages
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Internal Server Error
 */
app.get('/languages', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM languages');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /languages/{id}:
 *   get:
 *     description: Get a language by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The id of the language
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Language not found
 *       500:
 *         description: Internal Server Error
 */
app.get('/languages/:id', async (req, res) => {
  const id = req.params.id;

  // Check if the id is missing
  if (!id) {
    return res.status(400).json({ message: 'Missing language ID' });
  }

  // Check if the id is an integer
  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({ message: 'Invalid language ID' });
  }

  try {
    const result = await db.query('SELECT * FROM languages WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Language not found' });
    }

    const language = result.rows[0];

    // Check if the language name is null
    if (language.name === null) {
      return res.status(404).json({ message: 'Language not found' });
    }

    res.json(language);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /words:
 *   get:
 *     description: Get all words
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *       500:
 *         description: Internal Server Error
 */
app.get('/words', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM words');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /words/{id}:
 *   get:
 *     description: Get a word by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The id of the word
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *       404:
 *         description: Word not found
 *       500:
 *         description: Internal Server Error
 */
app.get('/words/:id(\\d+)', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query('SELECT * FROM words WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Word not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /words/{languageCode}:
 *   get:
 *     description: Get words with translations in a specific language
 *     parameters:
 *       - in: path
 *         name: languageCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The code of the language
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *       400:
 *         description: Invalid language code
 *       404:
 *         description: No words found with translations in this language
 *       500:
 *         description: Internal Server Error
 */
app.get('/words/:languageCode', async (req, res) => {
  const languageCode = req.params.languageCode;
  if (!/^[a-z]{2}$/.test(languageCode)) { // Assuming language codes are 2-letter lowercase strings
    res.status(400).json({ message: 'Invalid language code' });
    return;
  }
  try {
    const result = await db.query(
      `SELECT DISTINCT w.* FROM words w 
       JOIN translations t ON w.id = t.word_id 
       JOIN languages l ON t.language_id = l.id 
       WHERE l.code = $1`,
      [languageCode]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'No words found with translations in this language' });
    } else {
      res.json(result.rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /words/{wordId}/translations:
 *   get:
 *     description: Get translations of a word
 *     parameters:
 *       - in: path
 *         name: wordId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The id of the word
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               translation:
 *                 type: string
 *               language_name:
 *                 type: string
 *       404:
 *         description: Word not found
 *       500:
 *         description: Internal Server Error
 */
app.get('/words/:wordId/translations', async (req, res) => {
  const wordId = req.params.wordId;
  if (!Number.isInteger(parseInt(wordId))) {
    return res.status(404).json({ message: 'Word not found' });
  }
  try {
    const result = await db.query(
      'SELECT t.id, t.translation, l.name as language_name FROM translations t JOIN languages l ON t.language_id = l.id WHERE t.word_id = $1',
      [wordId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @swagger
 * /words/{wordId}/translations/{languageCode}:
 *   get:
 *     description: Get a translation of a word in a specific language
 *     parameters:
 *       - in: path
 *         name: wordId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The id of the word
 *       - in: path
 *         name: languageCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The code of the language
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             translation:
 *               type: string
 *       500:
 *         description: Internal Server Error
 */
app.get('/words/:wordId/translations/:languageCode', async (req, res) => {
  const wordId = req.params.wordId;
  const languageCode = req.params.languageCode;
  try {
    const result = await db.query(
      'SELECT t.id, t.translation FROM translations t JOIN languages l ON t.language_id = l.id WHERE t.word_id = $1 AND l.code = $2',
      [wordId, languageCode]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json({ translation: null }); // Return a valid JSON response when translation is not found
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Validate the request body
function validateRequestBody(body) {
  const { word, translations } = body;
  if (!word || !translations || !Array.isArray(translations)) {
    throw new Error('Invalid request body');
  }
}

// Check if the word exists in the database
async function getWordId(word) {
  const result = await db.query('SELECT * FROM words WHERE word = $1', [word]);
  return result.rows.length > 0 ? result.rows[0].id : null;
}

// Create or update the word in the database
async function createOrUpdateWord(word) {
  const existingWordId = await getWordId(word);
  if (existingWordId) {
    return existingWordId;
  } else {
    const result = await db.query('INSERT INTO words (word) VALUES ($1) RETURNING id', [word]);
    return result.rows[0].id;
  }
}

// Create or update a translation for a word
async function createOrUpdateTranslation(wordId, languageCode, translatedWord) {
  const languageResult = await db.query('SELECT id FROM languages WHERE code = $1', [languageCode]);
  if (languageResult.rows.length === 0) {
    throw new Error('Language not found');
  }
  const languageId = languageResult.rows[0].id;

  const existingTranslationResult = await db.query(
    'SELECT * FROM translations WHERE word_id = $1 AND language_id = $2',
    [wordId, languageId]
  );

  if (existingTranslationResult.rows.length > 0) {
    await db.query(
      'UPDATE translations SET translation = $1 WHERE word_id = $2 AND language_id = $3',
      [translatedWord, wordId, languageId]
    );
  } else {
    await db.query(
      'INSERT INTO translations (word_id, language_id, translation) VALUES ($1, $2, $3)',
      [wordId, languageId, translatedWord]
    );
  }
}

/**
 * @swagger
 * /words:
 *   post:
 *     description: Create or update a word and its translations
 *     requestBody:
 *       required: true
 *       schema:
 *         type: object
 *         properties:
 *           word:
 *             type: string
 *           translations:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 languageCode:
 *                   type: string
 *                 translation:
 *                   type: string
 *     responses:
 *       201:
 *         description: Word created or updated successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Language not found
 *       500:
 *         description: Internal Server Error
 */
app.post('/words', async (req, res) => {
  try {
    validateRequestBody(req.body);
    const wordId = await createOrUpdateWord(req.body.word);
    const translations = req.body.translations;
    for (const translation of translations) {
      await createOrUpdateTranslation(wordId, translation.languageCode, translation.translation);
    }
    res.status(201).json({ message: 'Word created or updated successfully' });
  } catch (err) {
    if (err.message === 'Invalid request body') {
      res.status(400).json({ message: err.message });
    } else if (err.message === 'Language not found') {
      res.status(404).json({ message: err.message });
    } else {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
});

/**
 * @swagger
 * /translations/{id}:
 *   get:
 *     description: Get a translation by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The id of the translation
 *     responses:
 *       200:
 *         description: Success
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             translation:
 *               type: string
 *             language_name:
 *               type: string
 *             word:
 *               type: string
 *       404:
 *         description: Translation not found
 *       500:
 *         description: Internal Server Error
 */
app.get('/translations/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query(
      'SELECT t.id, t.translation, l.name as language_name, w.word FROM translations t JOIN languages l ON t.language_id = l.id JOIN words w ON t.word_id = w.id WHERE t.id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Translation not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = app;