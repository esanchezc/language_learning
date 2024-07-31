const db = require('../config/database');

exports.getTranslationById = async (req, res) => {
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
};