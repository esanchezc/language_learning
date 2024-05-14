const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3001;

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'language_learning',
  password: 'postgres',
  port: 5432,
});

app.use(express.json());

// Get all languages
app.get('/languages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM languages');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get a language by id
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
    const result = await pool.query('SELECT * FROM languages WHERE id = $1', [id]);

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

// Get all words
app.get('/words', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM words');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get a word by id
app.get('/words/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query('SELECT * FROM words WHERE id = $1', [id]);
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

// Get all translations for a word
app.get('/words/:wordId/translations', async (req, res) => {
  const wordId = req.params.wordId;
  if (!Number.isInteger(parseInt(wordId))) {
    return res.status(404).json({ message: 'Word not found' });
  }
  try {
    const result = await pool.query(
      'SELECT t.id, t.translation, l.name as language_name FROM translations t JOIN languages l ON t.language_id = l.id WHERE t.word_id = $1',
      [wordId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/words/:wordId/translations/:languageCode', async (req, res) => {
  const wordId = req.params.wordId;
  const languageCode = req.params.languageCode;
  try {
    const result = await pool.query(
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
  const result = await pool.query('SELECT * FROM words WHERE word = $1', [word]);
  return result.rows.length > 0 ? result.rows[0].id : null;
}

// Create or update the word in the database
async function createOrUpdateWord(word) {
  const existingWordId = await getWordId(word);
  if (existingWordId) {
    return existingWordId;
  } else {
    const result = await pool.query('INSERT INTO words (word) VALUES ($1) RETURNING id', [word]);
    return result.rows[0].id;
  }
}

// Create or update a translation for a word
async function createOrUpdateTranslation(wordId, languageCode, translatedWord) {
  const languageResult = await pool.query('SELECT id FROM languages WHERE code = $1', [languageCode]);
  if (languageResult.rows.length === 0) {
    throw new Error('Language not found');
  }
  const languageId = languageResult.rows[0].id;

  const existingTranslationResult = await pool.query(
    'SELECT * FROM translations WHERE word_id = $1 AND language_id = $2',
    [wordId, languageId]
  );

  if (existingTranslationResult.rows.length > 0) {
    await pool.query(
      'UPDATE translations SET translation = $1 WHERE word_id = $2 AND language_id = $3',
      [translatedWord, wordId, languageId]
    );
  } else {
    await pool.query(
      'INSERT INTO translations (word_id, language_id, translation) VALUES ($1, $2, $3)',
      [wordId, languageId, translatedWord]
    );
  }
}

// Main method
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
// Get a translation by id
app.get('/translations/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query(
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