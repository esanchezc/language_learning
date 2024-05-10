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
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get a language by id
app.get('/languages/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query('SELECT * FROM languages WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Language not found' });
    } else {
      res.json(result.rows[0]);
    }
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

app.post('/words', async (req, res) => {
  const { word, translations } = req.body;

  if (!word || !translations || !Array.isArray(translations)) {
    return res.status(400).json({ message: 'Invalid request body' });
  }

  try {
    // Check if the word already exists
    const existingWordResult = await pool.query('SELECT * FROM words WHERE word = $1', [word]);
    let wordId;
    let wordCreated = false;

    if (existingWordResult.rows.length > 0) {
      // Word already exists, update it
      wordId = existingWordResult.rows[0].id;
    } else {
      // Create the word
      const wordResult = await pool.query('INSERT INTO words (word) VALUES ($1) RETURNING id', [word]);
      wordId = wordResult.rows[0].id;
      wordCreated = true;
    }

    // Create or update the translations
    for (const translation of translations) {
      const { languageCode, translation: translatedWord } = translation;
      if (!languageCode || !translatedWord) {
        return res.status(400).json({ message: 'Invalid translation data' });
      }

      // Get the language id
      const languageResult = await pool.query('SELECT id FROM languages WHERE code = $1', [languageCode]);
      if (languageResult.rows.length === 0) {
        return res.status(404).json({ message: 'Language not found' });
      }
      const languageId = languageResult.rows[0].id;

      // Check if a translation for this language already exists
      const existingTranslationResult = await pool.query(
        'SELECT * FROM translations WHERE word_id = $1 AND language_id = $2',
        [wordId, languageId]
      );

      if (existingTranslationResult.rows.length > 0) {
        // Update the existing translation
        await pool.query(
          'UPDATE translations SET translation = $1 WHERE word_id = $2 AND language_id = $3',
          [translatedWord, wordId, languageId]
        );
        translationUpdated = true;
      } else {
        // Create a new translation
        await pool.query(
          'INSERT INTO translations (word_id, language_id, translation) VALUES ($1, $2, $3)',
          [wordId, languageId, translatedWord]
        );
      }
    }

    if (wordCreated) {
      res.json({ message: 'Word created successfully' });
    } else {
      res.json({ message: 'Word updated successfully' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});