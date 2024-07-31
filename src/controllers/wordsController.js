const db = require('../config/database');

exports.getAllWords = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM words');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getWordById = async (req, res) => {
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
};

exports.getWordsByLanguage = async (req, res) => {
  const languageCode = req.params.languageCode;
  if (!/^[a-z]{2}$/.test(languageCode)) {
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
};

exports.getWordTranslations = async (req, res) => {
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
};

exports.getWordTranslationByLanguage = async (req, res) => {
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
      res.json({ translation: null });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.createOrUpdateWord = async (req, res) => {
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
};

function validateRequestBody(body) {
  const { word, translations } = body;
  if (!word || !translations || !Array.isArray(translations)) {
    throw new Error('Invalid request body');
  }
}

async function getWordId(word) {
  const result = await db.query('SELECT * FROM words WHERE word = $1', [word]);
  return result.rows.length > 0 ? result.rows[0].id : null;
}

async function createOrUpdateWord(word) {
  const existingWordId = await getWordId(word);
  if (existingWordId) {
    return existingWordId;
  } else {
    const result = await db.query('INSERT INTO words (word) VALUES ($1) RETURNING id', [word]);
    return result.rows[0].id;
  }
}

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