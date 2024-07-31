const db = require('../config/database');

exports.getAllLanguages = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM languages');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getLanguageById = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ message: 'Missing language ID' });
  }

  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({ message: 'Invalid language ID' });
  }

  try {
    const result = await db.query('SELECT * FROM languages WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Language not found' });
    }

    const language = result.rows[0];

    if (language.name === null) {
      return res.status(404).json({ message: 'Language not found' });
    }

    res.json(language);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};